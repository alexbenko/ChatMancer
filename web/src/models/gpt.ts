enum GPTModels {
    GPT4 = "gpt-4",
    GPT_4_TURBO_PREVIEW = "gpt-4-turbo-preview",
    GPT3_5_TURBO_1106 = "gpt-3.5-turbo-1106",
    GPT3_5_TURBO = "gpt-3.5-turbo",
    GPT_4_0125_PREVIEW = "gpt-4-0125-preview",
}

const gptModelsArray = Object.keys(GPTModels).map((key) => {
    return {
        displayName: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()), // Convert enum keys to friendly names
        value: GPTModels[key as keyof typeof GPTModels],
    };
});

export default gptModelsArray;
