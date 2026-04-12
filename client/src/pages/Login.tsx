import React, { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, Eye, EyeOff, Building2 } from "lucide-react";

export default function Login() {
  const { isAuthenticated, loading, refresh } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const redirect = new URLSearchParams(search).get("redirect") || "/dashboard";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setLocation(redirect);
    }
  }, [isAuthenticated, loading, setLocation, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register-org";
      const body = mode === "login"
        ? { email, password }
        : { email, password, name, orgName };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao processar requisição");
        return;
      }

      // Refresh auth state and redirect
      await refresh();
      setLocation(redirect);
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
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

          {/* Tab Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "login"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "register"
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Criar Empresa
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="orgName" className="text-gray-300 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Nome da Empresa
                  </Label>
                  <Input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Ex: Minha Empresa Ltda"
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300 text-sm">Seu nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Sua senha"}
                  required
                  minLength={mode === "register" ? 6 : undefined}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === "login" ? "Entrando..." : "Criando empresa..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Entrar" : "Criar Empresa e Conta"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Info for register mode */}
          {mode === "register" && (
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 text-xs text-blue-300">
              <p>Ao criar sua empresa, você será o administrador e poderá convidar sua equipe depois.</p>
              <p className="mt-1">Inclui 14 dias de teste gratuito.</p>
            </div>
          )}

          {/* Features */}
          <div className="space-y-3 pt-2">
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
                <p className="text-sm font-medium text-white">Vendas Consultivas (SPIN)</p>
                <p className="text-xs text-gray-500">Metodologia integrada ao seu pipeline</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Multi-Equipe</p>
                <p className="text-xs text-gray-500">Cada empresa com seus dados isolados</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
            <p>Tração Comercial - Plataforma segura</p>
          </div>
        </div>
      </div>
    </div>
  );
}
