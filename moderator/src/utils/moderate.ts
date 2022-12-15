const moderate = (bannedWords: string[], message: string) => {
  const bannedWordsInMessage = message.split(" ").filter((w) => bannedWords.includes(w));

  return {
    wasRejected: bannedWordsInMessage.length > 0,
    invalidWords: bannedWordsInMessage,
  };
};

export { moderate };
