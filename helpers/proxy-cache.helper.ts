export type CachedData = {
  key: string;
  response: any;
  timestamp: number;
};

const cachedFunctionResponse: {
  cachedResponses: CachedData[];
  fn: Function;
}[] = [];

export const proxyCache = async (fn: Function, args: any[]) => {
  const oneMinute = 1000 * 60;

  const key = JSON.stringify(args);
  let cachedFunction = cachedFunctionResponse.find(
    (cached) => cached.fn === fn
  );

  if (cachedFunction) {
    const { cachedResponses } = cachedFunction;
    const cached = cachedResponses.find((cached) => cached.key === key);

    if (cached && Date.now() - cached.timestamp < oneMinute) {
      return cached.response;
    }
  }

  if (!cachedFunction) {
    cachedFunctionResponse.push({ cachedResponses: [], fn });
    cachedFunction = cachedFunctionResponse[cachedFunctionResponse.length - 1];
  }

  const response = await fn(...args);
  cachedFunction.cachedResponses.push({ key, response, timestamp: Date.now() });
  return response;
};

let cleanUpIsCalled = false;

export const getNumberOfCachedResponses = () =>
  cachedFunctionResponse.reduce(
    (acc, { cachedResponses }) => acc + cachedResponses.length,
    0
  );

export const proxyCacheCleanupScheduler = () => {
  if (cleanUpIsCalled) {
    return;
  }

  cleanUpIsCalled = true;

  const oneMinute = 1000 * 60;
  setInterval(
    () =>
      cachedFunctionResponse.forEach(
        (cachedFunction) =>
          (cachedFunction.cachedResponses =
            cachedFunction.cachedResponses.filter(
              ({ timestamp }) => Date.now() - timestamp < oneMinute
            ))
      ),
    oneMinute
  );
};