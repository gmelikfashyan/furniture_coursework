import './App.css'
import {Outlet} from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer.jsx";

function App() {
    return (
        <div className="App">
            <Header />
            <main className="main-content">
                <Outlet /> {/* Здесь будут отображаться дочерние маршруты */}
            </main>
            <Footer />
        </div>
    )
}

export default App