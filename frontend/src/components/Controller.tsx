import { useState } from "react";
import Title from "./Title";
import axios from "axios";
import RecordMessage from "./RecordMessage";

const Controller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  function createBlobURL(data: Blob) {
    return URL.createObjectURL(data);
  }

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    // Append recorded message to messages
    const myMessage = { sender: "me", blobUrl };
    const messagesArr = [...messages, myMessage];

    // convert blob url to blob object
    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        // Construct audio to send as file
        const formData = new FormData();
        formData.append("audio", blob, "myFile.wav");

        try {
          const response = await axios.post(
            "http://localhost:8000/post-audio/",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data", // Correct content type
              },
            }
          );

          const rachelMessage = {
            sender: "rachel",
            blobUrl: createBlobURL(new Blob([response.data])),
          };

          messagesArr.push(rachelMessage);
          setMessages(messagesArr);

          // Play audio
          setIsLoading(false);
        } catch (error) {
          // console.error(error);
          setIsLoading(false);
        }
      });
  };

  return (
    <div className="h-screen overflow-y-hidden">
      {/* Title */}
      <Title setMessages={setMessages} />

      <div className="flex flex-col justify-between h-full overflow-y-scroll pb-96">
        {/* Conversation */}
        <div className="mt-5 px-5">
          {messages?.map((audio, index) => (
            <div
              key={index + audio.sender}
              className={`flex flex-col ${audio.sender === "rachel" && "flex items-end"}`}
            >
              {/* Sender */}
              <div className="mt-4">hello
                <p className={`ml-2 italic ${audio.sender === "rachel" ? "text-green-500" : "text-blue-500"}`}>
                  {audio.sender}
                </p>

                {/* Message */}
                <audio src={audio.blobUrl} className="appearance-none" controls />
              </div>
            </div>
          ))}

          {messages.length === 0 && !isLoading && (
            <div className="text-center font-light italic mt-10">
              Send Rachel a message...
            </div>
          )}

          {isLoading && (
            <div className="text-center font-light italic mt-10 animate-pulse">
              Gimme a few seconds...
            </div>
          )}
        </div>

        {/* Recorder */}
        <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-sky-500 to-green-500">
          <div className="flex justify-center items-center w-full">
            <div>
              <RecordMessage handleStop={handleStop} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controller;
