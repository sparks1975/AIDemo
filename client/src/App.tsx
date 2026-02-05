import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DemoPage from "@/pages/demo";
import EmbedPage from "@/pages/embed";
import InstructionsPage from "@/pages/instructions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DemoPage} />
      <Route path="/embed" component={EmbedPage} />
      <Route path="/instructions" component={InstructionsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
