import React, { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirecionar para dashboard se já autenticado
  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, loading, setLocation]);

  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">SG</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">SGRP</h1>
              <p className="text-gray-400 text-sm mt-2">
                Sistema de Geração de Receita Previsível
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 text-center">
            <p className="text-gray-300 text-sm leading-relaxed">
              Gerencie seus leads, oportunidades e pipeline de vendas com precisão. Aumente sua receita previsível com inteligência artificial e automações.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-400">+150%</div>
                <p className="text-xs text-gray-500">Produtividade</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-400">-40%</div>
                <p className="text-xs text-gray-500">Ciclo de Vendas</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-400">+85%</div>
                <p className="text-xs text-gray-500">Conversão</p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <div className="space-y-4">
            {loading ? (
              <Button
                disabled
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg font-semibold text-base transition-all"
              >
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Carregando...
              </Button>
            ) : (
              <a href={loginUrl}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg font-semibold text-base transition-all flex items-center justify-center gap-2">
                  Entrar com Manus
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            )}

            {/* Features */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Pipeline Inteligente</p>
                  <p className="text-xs text-gray-500">Gerencie oportunidades com drag-and-drop</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Previsão com IA</p>
                  <p className="text-xs text-gray-500">Análise de probabilidade de fechamento</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Automações Nativas</p>
                  <p className="text-xs text-gray-500">E-mails, tarefas e notificações automáticas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-6">
            <p>Plataforma segura com autenticação Manus OAuth</p>
          </div>
        </div>
      </div>
    </div>
  );
}
