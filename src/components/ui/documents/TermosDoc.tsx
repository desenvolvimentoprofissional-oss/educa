import React from 'react';
import { DocumentSection } from './DocumentSection';

interface TermosDocProps {
  bodyTextSize: string;
  textColor: string;
  subHeadingColor: string;
  numberBg: string;
  numberText: string;
}

export const TermosDoc: React.FC<TermosDocProps> = ({
  bodyTextSize, textColor, subHeadingColor, numberBg, numberText
}) => {
  const sectionProps = { bodyTextSize, textColor, subHeadingColor, numberBg, numberText };

  return (
    <div className="space-y-10 [&_p]:text-justify [&_li]:text-justify">
      <DocumentSection num={1} title="Aceite dos Termos" {...sectionProps}>
        <p>
          Ao acessar e utilizar o site do Conselho Regional de Administração de São Paulo (“CRA-SP” ou “Conselho”), disponível no endereço eletrônico https://www.crasp.gov.br/crasp/home/, você (“Usuário” ou “Visitante”) declara ter lido, compreendido e aceitado integralmente este Termo de Uso. <strong>Caso não concorde com qualquer disposição, recomenda-se que não utilize o site.</strong>
        </p>
      </DocumentSection>

      <DocumentSection num={2} title="Objetivo do Site" {...sectionProps}>
        <p className="mb-4">
          O site do CRA-SP visa disponibilizar informações institucionais, notícias, publicações, serviços on-line (tais como: registro profissional, atualização cadastral, emissão de certidões, reservas de espaços, entre outros) e conteúdos educativos relacionados à Administração e às atividades do Conselho.
        </p>
        <div className="mt-6">
          <h4 className="font-bold mb-2">2.1. Plataforma ENCOAD – Eventos e Inscrições</h4>
          <p>
            O CRA-SP disponibiliza também a plataforma subsidiária ENCOAD, voltada exclusivamente à inscrição e à gestão de participação em eventos, congressos e atividades institucionais. O uso desta plataforma está sujeito a termos de uso e aviso de privacidade próprios, mas alinhados com as diretrizes e normas do presente Termo, garantindo a mesma proteção aos dados dos usuários e o respeito à LGPD.
          </p>
        </div>
      </DocumentSection>

      <DocumentSection num={3} title="Propriedade Intelectual" {...sectionProps}>
        <p>
          Todo o conteúdo disponibilizado no site, incluindo textos, imagens, vídeos, logotipos, gráficos, áudios e documentos, pertencem ao CRA-SP ou é licenciado a este, estando protegido pelas legislações relacionadas à propriedade intelectual. É vedada a reprodução, distribuição ou qualquer forma de utilização para fins comerciais sem autorização prévia e expressa do Conselho.
        </p>
      </DocumentSection>

      <DocumentSection num={4} title="Responsabilidades do Usuário" {...sectionProps}>
        <p className="mb-4">O Usuário se compromete a:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Utilizar o site de forma ética, lícita e em conformidade com este Termo de Uso e com a legislação aplicável;</li>
          <li>Não inserir, transmitir ou disseminar conteúdos ilícitos ou contrários à moralidade;</li>
          <li>Zelar pela veracidade das informações fornecidas ao Conselho;</li>
          <li>Não compartilhar suas credenciais de acesso a áreas restritas, caso existam, com terceiros, assumindo integralmente a responsabilidade por eventuais danos decorrentes de uso indevido.</li>
        </ul>
      </DocumentSection>

      <DocumentSection num={5} title="Privacidade e Proteção de Dados Pessoais" {...sectionProps}>
        <p>
          Os dados pessoais coletados pelo CRA-SP são tratados conforme nosso Aviso de Privacidade e em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD). O Usuário poderá exercer seus direitos previstos na LGPD por meio dos canais de contato disponibilizados pelo Conselho.
        </p>
      </DocumentSection>

      <DocumentSection num={6} title="Exclusão de Responsabilidade" {...sectionProps}>
        <p className="mb-4">O CRA-SP não se responsabiliza por:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Danos ou prejuízos decorrentes de falhas de conexão ou indisponibilidade do site;</li>
          <li>Conteúdos ou serviços oferecidos por terceiros acessados por meio de links disponibilizados no site;</li>
          <li>Danos decorrentes de vírus ou outros elementos nocivos que possam ser introduzidos por terceiros, sem a anuência do Conselho.</li>
        </ul>
      </DocumentSection>

      <DocumentSection num={7} title="Links para Sites de Terceiros" {...sectionProps}>
        <p>
          O site pode conter links para outros sites que não são mantidos ou controlados pelo CRA-SP. O Conselho não se responsabiliza pelo conteúdo, políticas ou práticas de privacidade desses sites, recomendando-se que o Usuário leia os respectivos termos de uso e políticas de privacidade.
        </p>
      </DocumentSection>

      <DocumentSection num={8} title="Alterações no Termo de Uso" {...sectionProps}>
        <p>
          O CRA-SP se reserva o direito de alterar este Termo de Uso a qualquer momento, sendo recomendável que o Usuário o consulte periodicamente. As alterações terão efeito imediato após sua publicação no site.
        </p>
      </DocumentSection>

      <DocumentSection num={9} title="Lei Aplicável e Foro" {...sectionProps}>
        <p>
          Este Termo de Uso será regido e interpretado de acordo com as leis da República Federativa do Brasil. Eventuais litígios relacionados à sua interpretação ou execução deverão ser resolvidos no foro da comarca de São Paulo/SP, com renúncia a qualquer outro.
        </p>
      </DocumentSection>

      <div className="pt-4">
        <p className="font-bold">Última Atualização: 16/10/2025</p>
      </div>
    </div>
  );
};
