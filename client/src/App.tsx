import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { SGRPLayout } from "./components/SGRPLayout";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/"} component={() => <SGRPLayout><Home /></SGRPLayout>} />
      <Route path={"/dashboard"} component={() => <SGRPLayout><Home /></SGRPLayout>} />
      <Route path={"/leads"} component={() => <SGRPLayout><Home /></SGRPLayout>} />
      <Route path={"/contas"} component={() => <SGRPLayout><Home /></SGRPLayout>} />
      <Route path={"/contatos"} component={() => <SGRPLayout><Home /></SGRPLayout>} />
      <Route path={"/funil-vendas"} component={() => <SGRPLayout><Home /></SGRPLayout>} />
      <Route path={"/tarefas"} component={() => <SGRPLayout><Home /></SGRPLayout>} />
      <Route path={"/calendario"} component={() => <SGRPLayout><Home /></SGRPLayout>} />
      <Route path={"/previsao-receita"} component={() => <SGRPLayout><Home /></SGRPLayout>} />
      <Route path={"/expert-comercial"} component={() => <SGRPLayout><Home /></SGRPLayout>} />
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
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
