import { BrowserRouter } from "react-router-dom";
import MyRoutes from "./components/MyRoutes";
import { AuthProvider } from "./components/AuthContext";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <MyRoutes />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
