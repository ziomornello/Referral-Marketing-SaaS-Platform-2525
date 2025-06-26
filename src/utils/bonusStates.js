// 🔥 SISTEMA STATI BONUS PROGRESSIVI CON PERCENTUALI DINAMICHE

export const BONUS_STATES = {
  // Stati base sempre disponibili 
  NOT_STARTED: 'not_started',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  HIDDEN: 'hidden',

  // 🔥 STATI SPECIALI - Non costituiscono percentuale
  BLOCKED: 'blocked', // Admin blocca il bonus per l'utente
  USER_DECLINED: 'user_declined', // Utente non vuole fare il bonus
  
  // 🔥 NUOVO: In attesa di verifica del conto
  WAITING_VERIFICATION: 'waiting_verification',

  // Stati progressivi personalizzabili
  STEP_1: 'step_1',
  STEP_2: 'step_2', 
  STEP_3: 'step_3',
  STEP_4: 'step_4',
  STEP_5: 'step_5',
  STEP_6: 'step_6',
  STEP_7: 'step_7',
  STEP_8: 'step_8',
  STEP_9: 'step_9',
  STEP_10: 'step_10',

  // 🔥 STATI LEGACY - Manteniamo per compatibilità
  INTERESTED: 'interested',
  IN_PROGRESS: 'in_progress',
  WAITING_DEPOSIT: 'waiting_deposit',
  WAITING_PAYMENT: 'waiting_payment'
};

export const BONUS_STATE_CONFIG = {
  [BONUS_STATES.NOT_STARTED]: {
    label: '⚪ Non Iniziato',
    shortLabel: 'Non Iniziato',
    description: 'L\'utente non ha ancora iniziato questo bonus',
    color: 'text-gray-600 bg-gray-100',
    emoji: '⚪',
    userVisible: true,
    userLabel: '🚀 Inizia Ora',
    userDescription: 'Clicca per iniziare questo bonus',
    order: 0,
    isStep: false,
    submissionStatus: null, // Non crea submission
    isSpecial: false
  },

  // 🔥 NUOVO STATO: In attesa di verifica del conto
  [BONUS_STATES.WAITING_VERIFICATION]: {
    label: '📋 In Attesa di Verifica',
    shortLabel: 'Verifica Conto',
    description: 'In attesa della verifica del conto da parte del provider',
    color: 'text-indigo-600 bg-indigo-100',
    emoji: '📋',
    userVisible: true,
    userLabel: '📋 Verifica in Corso',
    userDescription: 'Il tuo conto è in fase di verifica',
    order: 0.6,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  // 🔥 STATI SPECIALI - Non costituiscono percentuale ma sempre disponibili
  [BONUS_STATES.BLOCKED]: {
    label: '🚫 Bloccato dall\'Admin',
    shortLabel: 'Bloccato',
    description: 'Bonus bloccato dall\'amministratore per questo utente',
    color: 'text-red-700 bg-red-200',
    emoji: '🚫',
    userVisible: false, // Non visibile all'utente
    userLabel: '',
    userDescription: '',
    order: 200,
    isStep: false,
    submissionStatus: 'blocked',
    isSpecial: true // 🔥 Flag per stati speciali
  },

  [BONUS_STATES.USER_DECLINED]: {
    label: '🙅 Utente Non Interessato',
    shortLabel: 'Non Interessato',
    description: 'L\'utente ha rifiutato questo bonus',
    color: 'text-orange-700 bg-orange-200',
    emoji: '🙅',
    userVisible: false, // Non visibile all'utente
    userLabel: '',
    userDescription: '',
    order: 201,
    isStep: false,
    submissionStatus: 'user_declined',
    isSpecial: true // 🔥 Flag per stati speciali
  },

  [BONUS_STATES.REJECTED]: {
    label: '❌ Rifiutato',
    shortLabel: 'Rifiutato',
    description: 'Il bonus è stato rifiutato',
    color: 'text-red-600 bg-red-100',
    emoji: '❌',
    userVisible: true,
    userLabel: '❌ Non Approvato',
    userDescription: 'Questo bonus non è stato approvato',
    order: 101,
    isStep: false,
    submissionStatus: 'rejected',
    isSpecial: true // 🔥 Flag per stati speciali
  },

  [BONUS_STATES.HIDDEN]: {
    label: '👁️‍🗨️ Nascosto',
    shortLabel: 'Nascosto',
    description: 'Bonus nascosto dall\'amministratore per questo utente',
    color: 'text-gray-500 bg-gray-100',
    emoji: '👁️‍🗨️',
    userVisible: false,
    userLabel: '',
    userDescription: '',
    order: 102,
    isStep: false,
    submissionStatus: 'hidden',
    isSpecial: true // 🔥 Flag per stati speciali
  },

  // 🔥 STATI LEGACY per compatibilità
  [BONUS_STATES.INTERESTED]: {
    label: '💡 Interessato',
    shortLabel: 'Interessato',
    description: 'L\'utente ha mostrato interesse',
    color: 'text-yellow-600 bg-yellow-100',
    emoji: '💡',
    userVisible: true,
    userLabel: '💡 Interessato',
    userDescription: 'Hai mostrato interesse per questo bonus',
    order: 0.5,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.IN_PROGRESS]: {
    label: '🔄 In Corso',
    shortLabel: 'In Corso',
    description: 'L\'utente sta lavorando al bonus',
    color: 'text-blue-600 bg-blue-100',
    emoji: '🔄',
    userVisible: true,
    userLabel: '🔄 In Corso',
    userDescription: 'Stai lavorando a questo bonus',
    order: 0.7,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.WAITING_DEPOSIT]: {
    label: '💳 Attesa Deposito',
    shortLabel: 'Attesa Deposito',
    description: 'In attesa del deposito dell\'utente',
    color: 'text-orange-600 bg-orange-100',
    emoji: '💳',
    userVisible: true,
    userLabel: '💳 Deposita',
    userDescription: 'Effettua il deposito richiesto',
    order: 0.8,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.WAITING_PAYMENT]: {
    label: '⏳ Attesa Pagamento',
    shortLabel: 'Attesa Pagamento',
    description: 'In attesa del pagamento del bonus',
    color: 'text-purple-600 bg-purple-100',
    emoji: '⏳',
    userVisible: true,
    userLabel: '⏳ In Attesa',
    userDescription: 'In attesa del pagamento',
    order: 0.9,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.STEP_1]: {
    label: '1️⃣ Passaggio 1',
    shortLabel: 'Passaggio 1',
    description: 'Primo passaggio del bonus',
    color: 'text-blue-600 bg-blue-100',
    emoji: '1️⃣',
    userVisible: true,
    userLabel: '1️⃣ Passaggio 1',
    userDescription: 'Primo passaggio completato',
    order: 1,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.STEP_2]: {
    label: '2️⃣ Passaggio 2',
    shortLabel: 'Passaggio 2',
    description: 'Secondo passaggio del bonus',
    color: 'text-indigo-600 bg-indigo-100',
    emoji: '2️⃣',
    userVisible: true,
    userLabel: '2️⃣ Passaggio 2',
    userDescription: 'Secondo passaggio completato',
    order: 2,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.STEP_3]: {
    label: '3️⃣ Passaggio 3',
    shortLabel: 'Passaggio 3',
    description: 'Terzo passaggio del bonus',
    color: 'text-purple-600 bg-purple-100',
    emoji: '3️⃣',
    userVisible: true,
    userLabel: '3️⃣ Passaggio 3',
    userDescription: 'Terzo passaggio completato',
    order: 3,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.STEP_4]: {
    label: '4️⃣ Passaggio 4',
    shortLabel: 'Passaggio 4',
    description: 'Quarto passaggio del bonus',
    color: 'text-pink-600 bg-pink-100',
    emoji: '4️⃣',
    userVisible: true,
    userLabel: '4️⃣ Passaggio 4',
    userDescription: 'Quarto passaggio completato',
    order: 4,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.STEP_5]: {
    label: '5️⃣ Passaggio 5',
    shortLabel: 'Passaggio 5',
    description: 'Quinto passaggio del bonus',
    color: 'text-red-600 bg-red-100',
    emoji: '5️⃣',
    userVisible: true,
    userLabel: '5️⃣ Passaggio 5',
    userDescription: 'Quinto passaggio completato',
    order: 5,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.STEP_6]: {
    label: '6️⃣ Passaggio 6',
    shortLabel: 'Passaggio 6',
    description: 'Sesto passaggio del bonus',
    color: 'text-orange-600 bg-orange-100',
    emoji: '6️⃣',
    userVisible: true,
    userLabel: '6️⃣ Passaggio 6',
    userDescription: 'Sesto passaggio completato',
    order: 6,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.STEP_7]: {
    label: '7️⃣ Passaggio 7',
    shortLabel: 'Passaggio 7',
    description: 'Settimo passaggio del bonus',
    color: 'text-yellow-600 bg-yellow-100',
    emoji: '7️⃣',
    userVisible: true,
    userLabel: '7️⃣ Passaggio 7',
    userDescription: 'Settimo passaggio completato',
    order: 7,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.STEP_8]: {
    label: '8️⃣ Passaggio 8',
    shortLabel: 'Passaggio 8',
    description: 'Ottavo passaggio del bonus',
    color: 'text-green-600 bg-green-100',
    emoji: '8️⃣',
    userVisible: true,
    userLabel: '8️⃣ Passaggio 8',
    userDescription: 'Ottavo passaggio completato',
    order: 8,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.STEP_9]: {
    label: '9️⃣ Passaggio 9',
    shortLabel: 'Passaggio 9',
    description: 'Nono passaggio del bonus',
    color: 'text-teal-600 bg-teal-100',
    emoji: '9️⃣',
    userVisible: true,
    userLabel: '9️⃣ Passaggio 9',
    userDescription: 'Nono passaggio completato',
    order: 9,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.STEP_10]: {
    label: '🔟 Passaggio 10',
    shortLabel: 'Passaggio 10',
    description: 'Decimo passaggio del bonus',
    color: 'text-cyan-600 bg-cyan-100',
    emoji: '🔟',
    userVisible: true,
    userLabel: '🔟 Passaggio 10',
    userDescription: 'Decimo passaggio completato',
    order: 10,
    isStep: true,
    submissionStatus: 'pending',
    isSpecial: false
  },

  [BONUS_STATES.COMPLETED]: {
    label: '🎉 Completato',
    shortLabel: 'Completato',
    description: 'Bonus completato con successo',
    color: 'text-green-600 bg-green-100',
    emoji: '🎉',
    userVisible: true,
    userLabel: '🎉 Completato!',
    userDescription: 'Hai completato con successo questo bonus!',
    order: 100,
    isStep: false,
    submissionStatus: 'approved',
    isSpecial: false
  }
};

export const getStateConfig = (state) => {
  return BONUS_STATE_CONFIG[state] || BONUS_STATE_CONFIG[BONUS_STATES.NOT_STARTED];
};

// 🔥 FUNZIONE PER MAPPARE STATO BONUS A SUBMISSION STATUS
export const getSubmissionStatusForState = (bonusState) => {
  const config = getStateConfig(bonusState);
  return config.submissionStatus || 'pending';
};

// 🔥 CALCOLO PERCENTUALE DINAMICA - ESCLUSI STATI SPECIALI
export const getStateProgress = (currentState, allowedStates = null) => {
  if (!allowedStates || !Array.isArray(allowedStates) || allowedStates.length === 0) {
    // Fallback per stati di default
    const defaultProgressMap = {
      [BONUS_STATES.NOT_STARTED]: 0,
      [BONUS_STATES.INTERESTED]: 10,
      [BONUS_STATES.IN_PROGRESS]: 25,
      [BONUS_STATES.WAITING_VERIFICATION]: 40, // 🔥 NUOVO
      [BONUS_STATES.WAITING_DEPOSIT]: 50,
      [BONUS_STATES.WAITING_PAYMENT]: 75,
      [BONUS_STATES.STEP_1]: 10,
      [BONUS_STATES.STEP_2]: 20,
      [BONUS_STATES.STEP_3]: 30,
      [BONUS_STATES.STEP_4]: 40,
      [BONUS_STATES.STEP_5]: 50,
      [BONUS_STATES.STEP_6]: 60,
      [BONUS_STATES.STEP_7]: 70,
      [BONUS_STATES.STEP_8]: 80,
      [BONUS_STATES.STEP_9]: 90,
      [BONUS_STATES.STEP_10]: 95,
      [BONUS_STATES.COMPLETED]: 100,
      // 🔥 Stati speciali non hanno percentuale fissa
      [BONUS_STATES.REJECTED]: 0,
      [BONUS_STATES.HIDDEN]: 0,
      [BONUS_STATES.BLOCKED]: 0,
      [BONUS_STATES.USER_DECLINED]: 0
    };
    return defaultProgressMap[currentState] || 0;
  }

  // 🔥 FILTRA STATI SPECIALI DAL CALCOLO PERCENTUALE
  const progressStates = allowedStates.filter(state => {
    const config = getStateConfig(state);
    return !config.isSpecial; // Escludi stati speciali dal calcolo
  });

  const currentIndex = progressStates.indexOf(currentState);
  
  if (currentIndex === -1) {
    // Se lo stato corrente è speciale, non ha percentuale
    const config = getStateConfig(currentState);
    if (config.isSpecial) return 0;
    
    // Se è COMPLETED, sempre 100%
    if (currentState === BONUS_STATES.COMPLETED) return 100;
    return 0;
  }

  // Se c'è solo NOT_STARTED e COMPLETED
  if (progressStates.length === 2 && 
      progressStates.includes(BONUS_STATES.NOT_STARTED) && 
      progressStates.includes(BONUS_STATES.COMPLETED)) {
    return currentState === BONUS_STATES.COMPLETED ? 100 : 0;
  }

  // Calcolo percentuale dinamica
  const totalSteps = progressStates.length - 1; // -1 perché NOT_STARTED è 0%
  if (totalSteps === 0) return 100; // Solo un stato

  // Distribuzione equa delle percentuali
  const percentage = Math.round((currentIndex / totalSteps) * 100);

  // Assicurati che NON_STARTED sia sempre 0% e COMPLETED sempre 100%
  if (currentState === BONUS_STATES.NOT_STARTED) return 0;
  if (currentState === BONUS_STATES.COMPLETED) return 100;

  return percentage;
};

// 🔥 TRANSIZIONI DINAMICHE - STATI SPECIALI SEMPRE DISPONIBILI
export const getNextStates = (currentState, allowedStates = null) => {
  if (!allowedStates || !Array.isArray(allowedStates)) {
    // Stati di default se non specificati
    return [
      BONUS_STATES.NOT_STARTED,
      BONUS_STATES.INTERESTED,
      BONUS_STATES.IN_PROGRESS,
      BONUS_STATES.WAITING_VERIFICATION, // 🔥 NUOVO
      BONUS_STATES.WAITING_DEPOSIT,
      BONUS_STATES.WAITING_PAYMENT,
      BONUS_STATES.STEP_1,
      BONUS_STATES.STEP_2,
      BONUS_STATES.COMPLETED,
      // 🔥 Stati speciali sempre disponibili
      BONUS_STATES.REJECTED,
      BONUS_STATES.HIDDEN,
      BONUS_STATES.BLOCKED,
      BONUS_STATES.USER_DECLINED
    ];
  }

  // 🔥 STATI SPECIALI SEMPRE DISPONIBILI
  const specialStates = [
    BONUS_STATES.REJECTED,
    BONUS_STATES.HIDDEN,
    BONUS_STATES.BLOCKED,
    BONUS_STATES.USER_DECLINED
  ];

  const currentIndex = allowedStates.indexOf(currentState);

  // Se lo stato corrente non è nella lista, permetti tutti gli stati + speciali
  if (currentIndex === -1) {
    return [...allowedStates, ...specialStates];
  }

  // Permetti transizioni a:
  // 1. Stati precedenti (per correzioni)
  // 2. Stato successivo
  // 3. Stati speciali (sempre disponibili)
  const possibleStates = [
    ...allowedStates.slice(0, currentIndex + 2), // Stati precedenti + successivo
    ...specialStates
  ];

  return [...new Set(possibleStates)]; // Rimuovi duplicati
};

export const canTransitionTo = (currentState, newState, allowedStates = null) => {
  const allowedNextStates = getNextStates(currentState, allowedStates);
  return allowedNextStates.includes(newState);
};

export const getStatesForFilter = () => {
  return Object.entries(BONUS_STATE_CONFIG)
    .filter(([key, config]) => config.isStep || key === BONUS_STATES.COMPLETED)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key, config]) => ({
      value: key,
      label: config.shortLabel,
      emoji: config.emoji,
      color: config.color
    }));
};

// 🔥 PARSING E STRINGIFYING MIGLIORATI
export const parseWorkflowStates = (workflowString) => {
  if (!workflowString || typeof workflowString !== 'string') {
    return [BONUS_STATES.NOT_STARTED, BONUS_STATES.COMPLETED];
  }

  const states = workflowString.split(',').map(state => state.trim());
  const validStates = states.filter(state => Object.values(BONUS_STATES).includes(state));

  // Assicurati che ci sia sempre NOT_STARTED all'inizio
  if (!validStates.includes(BONUS_STATES.NOT_STARTED)) {
    validStates.unshift(BONUS_STATES.NOT_STARTED);
  }

  // Assicurati che ci sia sempre COMPLETED alla fine (se non c'è REJECTED/HIDDEN)
  const hasEndState = validStates.some(state => 
    [BONUS_STATES.COMPLETED, BONUS_STATES.REJECTED, BONUS_STATES.HIDDEN].includes(state)
  );
  
  if (!hasEndState) {
    validStates.push(BONUS_STATES.COMPLETED);
  }

  return validStates;
};

export const stringifyWorkflowStates = (statesArray) => {
  if (!Array.isArray(statesArray) || statesArray.length === 0) {
    return `${BONUS_STATES.NOT_STARTED},${BONUS_STATES.COMPLETED}`;
  }

  return statesArray.join(',');
};

// 🔥 HELPER PER OTTENERE INFORMAZIONI SUL WORKFLOW
export const getWorkflowInfo = (workflowStates) => {
  const states = parseWorkflowStates(workflowStates);
  const steps = states.filter(state => {
    const config = getStateConfig(state);
    return config.isStep;
  });

  return {
    totalStates: states.length,
    totalSteps: steps.length,
    hasSteps: steps.length > 0,
    states: states,
    steps: steps
  };
};