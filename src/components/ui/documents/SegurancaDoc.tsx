import React from 'react';
import { DocumentSection } from './DocumentSection';

interface SegurancaDocProps {
  bodyTextSize: string;
  textColor: string;
  subHeadingColor: string;
  numberBg: string;
  numberText: string;
}

export const SegurancaDoc: React.FC<SegurancaDocProps> = ({
  bodyTextSize, textColor, subHeadingColor, numberBg, numberText
}) => {
  const sectionProps = { bodyTextSize, textColor, subHeadingColor, numberBg, numberText };
  
  return (
    <div className="space-y-10 [&_p]:text-justify [&_li]:text-justify">
      <DocumentSection num={1} title="Controle de Acesso" {...sectionProps}>
        <p>O acesso ao CRA-SP Educa e ao SIG é restrito a usuários autorizados e controlado por um sistema de autenticação. As credenciais de acesso são protegidas por protocolos de criptografia e autenticação robustos. O acesso às funcionalidades é baseado em perfis e permissões, seguindo o princípio do menor privilégio.</p>
      </DocumentSection>
      
      <DocumentSection num={2} title="Autenticação de Dois Fatores (2FA)" {...sectionProps}>
        <p>Recomendamos fortemente que todos os usuários ativem a autenticação de dois fatores em suas contas associadas ao sistema para adicionar uma camada crítica de proteção.</p>
      </DocumentSection>

      <DocumentSection num={3} title="Segurança dos Dados" {...sectionProps}>
        <p>Utilizamos protocolos de criptografia padrão da indústria (como TLS) para proteger os dados em trânsito entre seu navegador e nossos servidores. Os dados em repouso são protegidos por infraestrutura de nuvem com certificações de segurança internacionais.</p>
      </DocumentSection>

      <DocumentSection num={4} title="Monitoramento e Logs" {...sectionProps}>
        <p>Registramos eventos relevantes, como tentativas de login, alterações de senha e atividades críticas, para fins de auditoria, detecção de anomalias e monitoramento de atividades suspeitas.</p>
      </DocumentSection>

      <DocumentSection num={5} title="Responsabilidade do Usuário" {...sectionProps}>
        <p>A segurança é uma responsabilidade compartilhada. Mantenha sua senha confidencial, utilize senhas fortes e não as compartilhe. Encerre sua sessão (logout) sempre que terminar de usar o sistema, especialmente em computadores públicos ou compartilhados.</p>
      </DocumentSection>

      <DocumentSection num={6} title="Notificação de Incidentes de Segurança" {...sectionProps}>
        <p>Na improvável ocorrência de um incidente de segurança que possa acarretar risco ou dano relevante aos seus dados, o CRA-SP, por meio de seu Encarregado de Proteção de Dados (DPO), se compromete a comunicar os titulares afetados e a Autoridade Nacional de Proteção de Dados (ANPD) em prazo razoável, em conformidade com a legislação.</p>
      </DocumentSection>

      <DocumentSection num={7} title="Gestão de Incidentes de Segurança" {...sectionProps}>
        <p>Em caso de incidente de segurança que possa acarretar risco ou dano relevante, o CRA-SP seguirá procedimento interno estruturado, com registro do evento, análise de impacto, comunicação à ANPD e aos titulares afetados no menor prazo possível, e implementação imediata de medidas corretivas e preventivas.</p>
      </DocumentSection>
    </div>
  );
};
