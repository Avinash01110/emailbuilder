import "./App.css";
import EmailBuilder from "./components/EmailBuilder";
import {ToastContainer, Bounce} from "react-toastify";

function App() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
      <EmailBuilder />
    </>
  );
}

export default App;
