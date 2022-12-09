const moderate = (bannedWords: string[], message: string) => {
  const messageWords = message.split(" ");

  const bannedWordsInMessage = messageWords.filter((w) => bannedWords.includes(w));

  return {
    rejected: bannedWordsInMessage.length > 0,
    invalidWords: bannedWordsInMessage,
  };
};

export { moderate };
