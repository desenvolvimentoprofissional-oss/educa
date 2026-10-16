import React, { useState } from 'react';
import { DocumentSection } from './DocumentSection';

interface PrivacidadeDocProps {
  bodyTextSize: string;
  textColor: string;
  subHeadingColor: string;
  numberBg: string;
  numberText: string;
}

export const PrivacidadeDoc: React.FC<PrivacidadeDocProps> = ({
  bodyTextSize, textColor, subHeadingColor, numberBg, numberText
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sectionProps = { bodyTextSize, textColor, subHeadingColor, numberBg, numberText };

  return (
    <div className="space-y-10 [&_p]:text-justify [&_li]:text-justify">
      <DocumentSection num={1} title="Quais dados coletamos e por quê?" {...sectionProps}>
        <p className="mb-4">Coletamos apenas os dados pessoais necessários, de acordo com os serviços disponíveis:</p>
        
        <div className="overflow-x-auto mb-6 border rounded-xl border-gray-200">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#172554] text-white">
                <th className="p-4 border-b border-r border-[#172554] font-bold w-1/4">Serviço/Área</th>
                <th className="p-4 border-b border-r border-[#172554] font-bold w-1/3">Dados coletados</th>
                <th className="p-4 border-b border-[#172554] font-bold w-auto">Finalidade do tratamento</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 border-r border-gray-200 font-bold text-gray-900">Área do Profissional</td>
                <td className="p-4 border-r border-gray-200 text-gray-700">CPF, registro, e-mail, senha, nome, telefone</td>
                <td className="p-4 text-gray-700">Acesso ao portal, atualização cadastral, emissão de documentos.</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 border-r border-gray-200 font-bold text-gray-900">Inscrição e Registro</td>
                <td className="p-4 border-r border-gray-200 text-gray-700">Nome, CPF, RG, data de nascimento, endereço, e-mail, telefone, diploma, foto, dados bancários</td>
                <td className="p-4 text-gray-700">Realizar inscrição, emissão de registro e cobrança de taxas.</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 border-r border-gray-200 font-bold text-gray-900">Fale Conosco</td>
                <td className="p-4 border-r border-gray-200 text-gray-700">Nome, e-mail, telefone, mensagem</td>
                <td className="p-4 text-gray-700">Atendimento a dúvidas, reclamações e solicitações.</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 border-r border-gray-200 font-bold text-gray-900">Ouvidoria</td>
                <td className="p-4 border-r border-gray-200 text-gray-700">Nome, e-mail, telefone, CPF (opcional), mensagem</td>
                <td className="p-4 text-gray-700">Recebimento de manifestações e denúncias.</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 border-r border-gray-200 font-bold text-gray-900">Eventos e Cursos</td>
                <td className="p-4 border-r border-gray-200 text-gray-700">Nome, CPF, e-mail, telefone, instituição, cargo, dados de pagamento</td>
                <td className="p-4 text-gray-700">Inscrição em eventos, emissão de certificados, comunicação.</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 border-r border-gray-200 font-bold text-gray-900">Newsletter / Informativos</td>
                <td className="p-4 border-r border-gray-200 text-gray-700">Nome, e-mail</td>
                <td className="p-4 text-gray-700">Envio de notícias e atualizações institucionais.</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50/50">
                <td className="p-4 border-r border-gray-200 font-bold text-gray-900">Dados de navegação</td>
                <td className="p-4 border-r border-gray-200 text-gray-700">Endereço IP, data e hora, geolocalização (quando aplicável)</td>
                <td className="p-4 text-gray-700">Segurança, prevenção a fraudes, estatísticas de acesso.</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="p-4 border-r border-gray-200 font-bold text-gray-900">Imagens autorizadas</td>
                <td className="p-4 border-r border-gray-200 text-gray-700">Fotografias institucionais</td>
                <td className="p-4 text-gray-700">Divulgação em materiais e no site, mediante autorização.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mb-4">Todos os dados são tratados com base no princípio da necessidade e para finalidades legítimas, informadas e específicas.</p>
        <p>Além dos serviços e áreas já descritos neste Aviso, o CRA/SP também opera a plataforma de inscrições ENCOAD, utilizada para a realização de eventos, palestras e cursos. Os dados pessoais tratados nesta plataforma seguem os mesmos princípios de privacidade, transparência e conformidade com a LGPD estabelecidos neste documento, sendo regidos por aviso de privacidade específico complementar, acessível diretamente na própria plataforma.</p>
      </DocumentSection>
      
      <DocumentSection num={2} title="Como coletamos os dados" {...sectionProps}>
        <p>Os dados são coletados diretamente por meio de formulários eletrônicos, áreas restritas, cadastros em eventos, inscrições profissionais e comunicações voluntárias, sempre com transparência e consentimento informado, garantindo a finalidade legítima e a proteção integral ao titular.</p>
      </DocumentSection>

      <DocumentSection num={3} title="Base legal para o tratamento" {...sectionProps}>
        <p>As atividades de tratamento são fundamentadas nas bases legais previstas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), garantindo sempre a conformidade e o respeito aos direitos dos titulares. Utilizamos, em especial, as seguintes bases: o consentimento do titular (art. 7º, I) e o cumprimento de obrigação legal ou regulatória (art. 7º, II), sempre observando os direitos e liberdades fundamentais.</p>
      </DocumentSection>

      <DocumentSection num={4} title="Compartilhamento de dados" {...sectionProps}>
        <p className="mb-4">O CRA/SP poderá compartilhar dados pessoais apenas quando necessário e em conformidade com a LGPD, incluindo:</p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>Autoridades públicas ou órgãos governamentais, como ANPD, TCU, CGU, Ministério Público Federal, Receita Federal, Instituições Financeiras e Conselho Federal de Administração, para cumprimento de obrigações legais ou regulatórias e atividades de fiscalização; prestadores de serviços contratados que atuem em nome do CRA/SP, sempre sujeitos a obrigações de confidencialidade e segurança;</li>
          <li>Quando expressamente autorizado pelo titular dos dados.</li>
        </ul>
        <p>Não realizamos venda ou repasse indevido de dados pessoais a terceiros. O compartilhamento visa exclusivamente cumprir finalidades legítimas e assegurar a execução dos serviços públicos ou atender exigências legais.</p>
      </DocumentSection>

      <DocumentSection num={5} title="Armazenamento e segurança" {...sectionProps}>
        <p className="mb-4">Os dados pessoais são armazenados em ambiente seguro e controlado, com acesso restrito a pessoas autorizadas e sujeitas a dever de confidencialidade. Adotamos medidas técnicas e administrativas apropriadas para proteger os dados contra acessos não autorizados, destruição, perda, alteração, comunicação ou difusão inadequada.</p>
        <p>Entre as medidas de segurança estão: controles de acesso, monitoramento de logs, backup, criptografia quando aplicável e treinamentos periódicos com as equipes. Os dados são mantidos apenas pelo tempo necessário para o cumprimento das finalidades informadas ou conforme obrigações legais e regulatórias. Após esse período, os dados serão eliminados ou anonimizados, salvo se houver determinação legal pela manutenção da guarda e/ou armazenamento.</p>
      </DocumentSection>

      <DocumentSection num={6} title="Direitos do titular" {...sectionProps}>
        <p className="mb-6">O titular dos dados pessoais possui direitos garantidos pela LGPD, podendo a qualquer momento solicitar: confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, anonimização, bloqueio ou eliminação de dados desnecessários, portabilidade, eliminação dos dados tratados com consentimento, informação sobre compartilhamentos, revogação do consentimento e oposição ao tratamento quando cabível.</p>
        
        <p className="font-bold mb-8 text-[15px]">Constituem direitos dos titulares de dados pessoais:</p>
        
        {!imageError && (
          <div className="mb-10 w-full overflow-hidden flex justify-center">
            <img 
              src="/direitos-titular.png" 
              alt="Grid oficial de direitos dos titulares com ilustrações" 
              className="w-full max-w-3xl h-auto object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        )}

        <p>O CRA/SP disponibiliza canal específico para exercício desses direitos, mediante solicitação enviada ao e-mail: lgpd@crasp.org.br. Todas as solicitações serão analisadas e respondidas no prazo legal, assegurando a transparência e o atendimento adequado ao titular.</p>
      </DocumentSection>

      <DocumentSection num={7} title="Uso de cookies" {...sectionProps}>
        <p className="mb-4">O site do CRA/SP utiliza cookies estritamente necessários para garantir o seu funcionamento adequado, segurança e otimização da experiência do usuário. Poderão ser utilizados cookies analíticos ou de desempenho, mediante coleta de consentimento prévio e explícito do titular.</p>
        <p>Os usuários podem, a qualquer momento, configurar seus navegadores para bloquear ou alertar sobre a coleta de cookies, lembrando que o bloqueio de alguns tipos pode impactar a experiência no site. Para mais informações, recomendamos consultar nossa Política de Cookies.</p>
      </DocumentSection>

      <DocumentSection num={8} title="Prazo de retenção" {...sectionProps}>
        <p>Os dados pessoais serão armazenados pelo período estritamente necessário ao cumprimento das finalidades para as quais foram coletados ou conforme exigências legais e regulatórias aplicáveis. Findo esse prazo, os dados serão eliminados ou anonimizados, salvo nas situações em que a conservação seja necessária para cumprimento de obrigação legal, exercício regular de direitos em processos judiciais ou administrativos, ou ainda para atender solicitações de autoridades competentes.</p>
      </DocumentSection>

      <DocumentSection num={9} title="Encarregado de Dados (DPO)" {...sectionProps}>
        <p className="mb-4">Em cumprimento ao art. 41 da Lei Geral de Proteção de Dados (LGPD), o CRA/SP indica como Encarregada de Dados Pessoais (Data Protection Officer - DPO), responsável por atuar como canal de comunicação entre o CRA/SP, os titulares dos dados, Autoridade Nacional de Proteção de Dados (ANPD) e demais autoridades.</p>
        <ul className="space-y-1 mb-4">
          <li><strong>Nome:</strong> Allmo Consultoria Ltda.</li>
          <li><strong>E-mail:</strong> lgpd@crasp.org.br</li>
        </ul>
        <p>A Encarregada de dados está disponível para esclarecer dúvidas, receber solicitações e atender quaisquer questões relacionadas ao tratamento de dados pessoais.</p>
      </DocumentSection>

      <DocumentSection num={10} title="Atualizações deste aviso" {...sectionProps}>
        <p className="mb-4">Este Aviso de Privacidade poderá ser atualizado a qualquer momento para refletir melhorias nas práticas de tratamento de dados pessoais, alterações legais ou mudanças nas finalidades de uso. Recomendamos que os titulares consultem este documento periodicamente para se manterem informados sobre eventuais modificações. Caso ocorram alterações relevantes que demandem novo consentimento, os titulares serão devidamente comunicados.</p>
        <p className="font-bold">Última Atualização: 16/10/2025</p>
      </DocumentSection>
    </div>
  );
};
