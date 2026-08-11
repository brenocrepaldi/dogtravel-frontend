"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Loader2, LocateFixed, MapPin, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowActions } from "@/components/common/flow-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LocationPickerClient } from "../location-picker-client";
import type { WalkFormData } from "../walk-request-form";

// ─── Geocoding helpers ─────────────────────────────────────────────────────

interface NominatimAddress {
  road?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  quarter?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
}

interface ParsedAddress {
  street:       string; // road + house_number
  neighborhood: string; // suburb / neighbourhood / quarter
  city:         string; // city / town / village
  combined:     string; // all joined (used for geocoding & display)
}

async function reverseGeocode(lat: number, lng: number): Promise<ParsedAddress> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`,
    { headers: { "User-Agent": "DogTravel/1.0 (app)" } }
  );
  const json = await res.json() as { address?: NominatimAddress };
  const addr = json.address;

  if (!addr) {
    const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    return { street: fallback, neighborhood: "", city: "", combined: fallback };
  }

  const street       = [addr.road, addr.house_number].filter(Boolean).join(", ");
  const neighborhood = addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? "";
  const city         = addr.city ?? addr.town ?? addr.village ?? "";
  const combined     = [street, neighborhood, city, addr.state].filter(Boolean).join(", ");

  return { street, neighborhood, city, combined };
}

async function forwardGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=pt-BR`,
    { headers: { "User-Agent": "DogTravel/1.0 (app)" } }
  );
  const results = await res.json() as Array<{ lat: string; lon: string }>;
  if (!results.length) return null;
  const first = results[0]!;
  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
}

function buildCombinedAddress(d: Pick<WalkFormData, "addressStreet" | "addressComplement" | "addressNeighborhood" | "addressCity">) {
  return [d.addressStreet, d.addressComplement, d.addressNeighborhood, d.addressCity]
    .filter(Boolean)
    .join(", ");
}

// ─── Component ─────────────────────────────────────────────────────────────

type GeoStatus = "idle" | "loading" | "found" | "not_found";

interface Props {
  data: WalkFormData;
  updateData: (partial: Partial<WalkFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepLocation({ data, updateData, onNext, onBack }: Props) {
  const [locating,  setLocating]  = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  const hasCoords  = data.lat !== null && data.lng !== null;
  const canGeocode = !!data.addressStreet && !!data.addressCity;
  const showWarn   = canGeocode && !hasCoords && geoStatus === "not_found";
  const isValid    = canGeocode && hasCoords && geoStatus !== "loading";

  // ── Update a single address field, recompute combined, clear coords ────
  function updateField(
    field: "addressStreet" | "addressComplement" | "addressNeighborhood" | "addressCity",
    value: string
  ) {
    const next = { ...data, [field]: value };
    const address = buildCombinedAddress(next);
    updateData({ [field]: value, address, lat: null, lng: null });
  }

  // ── Forward geocode (debounced) when street + city are filled ──────────
  useEffect(() => {
    if (!data.addressStreet || !data.addressCity) {
      setGeoStatus("idle");
      return;
    }
    if (data.lat !== null && data.lng !== null) return;

    setGeoStatus("loading");

    const timer = setTimeout(async () => {
      try {
        const result = await forwardGeocode(data.address);
        if (result) {
          updateData({ lat: result.lat, lng: result.lng });
          setGeoStatus("found");
        } else {
          setGeoStatus("not_found");
        }
      } catch {
        setGeoStatus("not_found");
      }
    }, 800);

    return () => clearTimeout(timer);
    // updateData intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.address, data.lat, data.lng]);

  // ── Geolocation button ─────────────────────────────────────────────────
  async function useCurrentLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const parsed = await reverseGeocode(lat, lng);
          updateData({
            addressStreet:       parsed.street,
            addressComplement:   "",
            addressNeighborhood: parsed.neighborhood,
            addressCity:         parsed.city,
            address:             parsed.combined,
            lat,
            lng,
          });
          setGeoStatus("found");
        } catch {
          updateData({ lat, lng });
          setGeoStatus("found");
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false)
    );
  }

  // ── Marker drag → reverse geocode ─────────────────────────────────────
  async function handleMarkerDrag(newLat: number, newLng: number) {
    updateData({ lat: newLat, lng: newLng });
    setAdjusting(true);
    try {
      const parsed = await reverseGeocode(newLat, newLng);
      updateData({
        addressStreet:       parsed.street,
        addressComplement:   "",
        addressNeighborhood: parsed.neighborhood,
        addressCity:         parsed.city,
        address:             parsed.combined,
      });
    } catch {
      // keep existing
    } finally {
      setAdjusting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Local de partida</h2>
        <p className="text-sm text-muted-foreground">
          De onde o passeador buscará seu cão?
        </p>
      </div>

      {/* Address fields */}
      <div className="space-y-3">
        {/* Street + number — full width */}
        <div className="space-y-1.5">
          <Label htmlFor="street" className="text-sm font-medium">
            Logradouro e número <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="street"
              className="pl-9"
              placeholder="Rua das Flores, 120"
              value={data.addressStreet ?? ""}
              onChange={(e) => updateField("addressStreet", e.target.value)}
            />
          </div>
        </div>

        {/* Complement + Neighborhood — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="complement" className="text-sm font-medium">
              Complemento
            </Label>
            <Input
              id="complement"
              placeholder="Apto 42, Bloco B"
              value={data.addressComplement ?? ""}
              onChange={(e) => updateField("addressComplement", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="neighborhood" className="text-sm font-medium">
              Bairro
            </Label>
            <Input
              id="neighborhood"
              placeholder="Moema"
              value={data.addressNeighborhood ?? ""}
              onChange={(e) => updateField("addressNeighborhood", e.target.value)}
            />
          </div>
        </div>

        {/* City — full width */}
        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-sm font-medium">
            Cidade <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="city"
              placeholder="São Paulo"
              value={data.addressCity ?? ""}
              onChange={(e) => updateField("addressCity", e.target.value)}
            />
            {geoStatus === "loading" && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin pointer-events-none" />
            )}
          </div>

          {/* Warning */}
          {showWarn && (
            <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                Endereço não encontrado. Confira o nome da rua e cidade.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Geolocation button */}
      <Button
        variant="outline"
        type="button"
        onClick={useCurrentLocation}
        disabled={locating}
        className={cn("gap-2 w-full sm:w-auto cursor-pointer", locating && "opacity-70")}
      >
        <LocateFixed className={locating ? "h-4 w-4 animate-pulse" : "h-4 w-4"} />
        {locating ? "Obtendo localização..." : "Usar minha localização atual"}
      </Button>

      {/* Map */}
      {hasCoords && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 border border-border/50 px-3 py-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-xs text-foreground leading-relaxed flex-1 truncate">
              {adjusting ? "Atualizando endereço..." : data.address}
            </span>
            {adjusting && (
              <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />
            )}
          </div>

          <div className="rounded-xl overflow-hidden border border-border h-64">
            <LocationPickerClient
              key={`${data.lat!.toFixed(2)},${data.lng!.toFixed(2)}`}
              lat={data.lat!}
              lng={data.lng!}
              onDragEnd={handleMarkerDrag}
            />
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            Arraste o marcador para ajustar a posição exata
          </p>
        </div>
      )}

      <FlowActions
        showBack
        onBack={onBack}
        primaryLabel="Continuar"
        primaryIcon={<ArrowRight className="h-4 w-4" />}
        onPrimary={onNext}
        primaryDisabled={!isValid}
      />
    </div>
  );
}
