interface Props {
  onSignOut: () => void;
}

export function CompleteProfileHeader({ onSignOut }: Props) {
  return (
    <header className="w-full bg-white border-b border-gray-200 py-[16px] px-6 md:px-12 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-[12px]">
        <div className="w-10 h-[40px] bg-blue-900 flex items-center justify-center rounded-xl shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
            CRA-SP Educa
          </h1>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-0.5">
            Etapa Final
          </p>
        </div>
      </div>
      <button 
        type="button" 
        onClick={onSignOut}
        className="text-gray-500 hover:text-gray-800 font-semibold text-sm transition-colors px-[16px] py-2 rounded-full hover:bg-gray-100"
        aria-label="Sair e voltar depois"
      >
        Sair
      </button>
    </header>
  );
}
