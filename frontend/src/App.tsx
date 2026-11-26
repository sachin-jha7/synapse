import './App.css'
import Home from './pages/Home'
import MessageProvider from './context/MessageContext'


function App() {


  return (
    <>
      <MessageProvider>
        <Home />
      </MessageProvider>
    </>
  )
}

export default App
