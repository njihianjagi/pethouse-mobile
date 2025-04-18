import React, { useContext } from 'react'

export const OnboardingConfigContext = React.createContext({} as any)

export const OnboardingConfigProvider = ({ children, config }) => {
  const value = {
    config: config,
  }

  return (
    <OnboardingConfigContext.Provider value={value}>
      {children}
    </OnboardingConfigContext.Provider>
  )
}

export const useOnboardingConfig = () => useContext(OnboardingConfigContext)
