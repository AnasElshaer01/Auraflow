import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/dashboard";
import Mentions from "@/pages/mentions";
import Keywords from "@/pages/keywords";
import Alerts from "@/pages/alerts";
import Summaries from "@/pages/summaries";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/mentions">
        <Layout>
          <Mentions />
        </Layout>
      </Route>
      <Route path="/keywords">
        <Layout>
          <Keywords />
        </Layout>
      </Route>
      <Route path="/alerts">
        <Layout>
          <Alerts />
        </Layout>
      </Route>
      <Route path="/summaries">
        <Layout>
          <Summaries />
        </Layout>
      </Route>
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
