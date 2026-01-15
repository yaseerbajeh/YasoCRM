import Header from './components/Header';
import ContactDetails from './components/ContactDetails';
import ChatView from './components/ChatView';
import ConversationsList from './components/ConversationsList';
import VerticalNav from './components/VerticalNav';

function App() {
  return (
    <div className="h-screen flex flex-col" dir="rtl">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <VerticalNav />
        <ConversationsList />
        <ChatView />
        <ContactDetails />
      </div>
    </div>
  );
}

export default App;
