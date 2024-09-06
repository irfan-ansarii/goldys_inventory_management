import { useEffect, useState } from "react";

export const useStream = () => {
  const [response, setResponse] = useState();

  const connectToStream = () => {
    const eventSource = new EventSource("/api/stream");

    eventSource.addEventListener("message", (event) => {
      const tmp = JSON.parse(event.data);

      setResponse(tmp);
    });

    eventSource.addEventListener("error", () => {
      eventSource.close();
      setTimeout(connectToStream, 1);
    });

    eventSource.close = () => {
      setTimeout(connectToStream, 1);
    };
    return eventSource;
  };

  useEffect(() => {
    const eventSource = connectToStream();
    return () => {
      eventSource.close();
    };
  }, []);
  return response;
};
