// Copy shared by the desktop cards and the mobile list + sheets, so both layouts
// always tell the walker the same thing.

export const IDENTITY_COPY = {
  title: "Verificação de Identidade",
  description: "Documento oficial + selfie segurando o documento",
  docHint: "RG, CNH ou passaporte · PDF ou imagem · máx. 5 MB",
  selfieHint: "Foto segurando o documento aberto · JPG ou PNG · máx. 5 MB",
  rejected:
    "Seus documentos foram recusados. Verifique se a foto está nítida, o documento está visível e dentro da validade, e reenvie para nova análise.",
  pending:
    "Seus documentos foram recebidos e estão em análise. A verificação é realizada em até 3 dias úteis. Você será notificado por e-mail quando concluída.",
  verified:
    "Identidade verificada e aprovada pela DogTravel. Suas informações estão protegidas e a verificação é válida por 12 meses.",
} as const;

export const BACKGROUND_COPY = {
  title: "Antecedentes Criminais",
  description: "Certidão emitida nos últimos 90 dias",
  hint: "PDF ou imagem · emitida nos últimos 90 dias · máx. 5 MB",
  why: "Exigida para garantir a segurança de tutores e pets em todos os passeios. Pode ser emitida gratuitamente pelo portal do governo federal e deve ter sido emitida nos últimos 90 dias.",
  govUrl: "https://www.gov.br/pt-br/servicos/emitir-certidao-de-antecedentes-criminais",
  rejected:
    "Sua certidão foi recusada. Verifique se é uma certidão de antecedentes criminais válida, emitida nos últimos 90 dias, e reenvie para nova análise.",
  pending:
    "Certidão recebida e em análise pela equipe DogTravel. A verificação é realizada em até 5 dias úteis. Você será notificado por e-mail quando concluída.",
  verified:
    "Antecedentes criminais verificados e aprovados. A checagem é válida por 12 meses a partir da data de emissão do documento.",
} as const;
