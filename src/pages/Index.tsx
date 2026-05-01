import { useState } from "react";
import { Lobby } from "@/components/Lobby";
import { Room } from "@/components/Room";

interface Session {
  name: string;
  code: string;
  role: "host" | "guest";
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <>
      {!session ? (
        <Lobby onJoin={(s) => setSession({ name: s.name, code: s.code, role: s.role })} />
      ) : (
        <Room
          userName={session.name}
          roomCode={session.code}
          role={session.role}
          onLeave={() => setSession(null)}
        />
      )}
    </>
  );
};

export default Index;
