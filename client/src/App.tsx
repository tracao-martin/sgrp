import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { SGRPLayout } from "./components/SGRPLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Contas from "./pages/Contas";
import Contatos from "./pages/Contatos";
import FunilVendas from "./pages/FunilVendas";
import Tarefas from "./pages/Tarefas";
import Calendario from "./pages/Calendario";
import PrevisaoReceita from "./pages/PrevisaoReceita";
import ExpertComercial from "./pages/ExpertComercial";
import Configuracoes from "./pages/Configuracoes";
import Usuarios from "./pages/Usuarios";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/"} component={() => <SGRPLayout><Dashboard /></SGRPLayout>} />
      <Route path={"/dashboard"} component={() => <SGRPLayout><Dashboard /></SGRPLayout>} />
      <Route path={"/leads"} component={() => <SGRPLayout><Leads /></SGRPLayout>} />
      <Route path={"/contas"} component={() => <SGRPLayout><Contas /></SGRPLayout>} />
      <Route path={"/contatos"} component={() => <SGRPLayout><Contatos /></SGRPLayout>} />
      <Route path={"/funil-vendas"} component={() => <SGRPLayout><FunilVendas /></SGRPLayout>} />
      <Route path={"/tarefas"} component={() => <SGRPLayout><Tarefas /></SGRPLayout>} />
      <Route path={"/calendario"} component={() => <SGRPLayout><Calendario /></SGRPLayout>} />
      <Route path={"/previsao-receita"} component={() => <SGRPLayout><PrevisaoReceita /></SGRPLayout>} />
      <Route path={"/expert-comercial"} component={() => <SGRPLayout><ExpertComercial /></SGRPLayout>} />
      <Route path={"/configuracoes"} component={() => <SGRPLayout><Configuracoes /></SGRPLayout>} />
      <Route path={"/usuarios"} component={() => <SGRPLayout><Usuarios /></SGRPLayout>} />
      <Route path={"/admin/usuarios"} component={() => <SGRPLayout><Usuarios /></SGRPLayout>} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
