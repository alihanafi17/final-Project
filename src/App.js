import { BrowserRouter } from "react-router-dom";
import MyRoutes from "./components/MyRoutes";
import { CartProvider } from "./context/CartContext";
import "./App.css";

function App() {
  return (
    <div className="App">
      <CartProvider>
        <BrowserRouter>
          <MyRoutes/>
        </BrowserRouter>
      </CartProvider>
    </div>
  );
}

export default App;