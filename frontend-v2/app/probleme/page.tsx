import Header from "../../components/Header";
import ChatInterface from "../../components/ChatInterface";

export default function ProblemePage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-100 py-10 px-6 w-full min-w-0 overflow-x-hidden">
        <ChatInterface />
      </main>
    </>
  );
}
