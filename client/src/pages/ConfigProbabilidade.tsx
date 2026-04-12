import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Percent,
  Save,
  RotateCcw,
  TrendingUp,
  BarChart3,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface StageProbability {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  probabilidade: number;
  probabilidadeOriginal: number;
}

interface PipelineConfig {
  id: string;
  nome: string;
  ativo: boolean;
  stages: StageProbability[];
}

const INITIAL_CONFIGS: PipelineConfig[] = [
  {
    id: "1",
    nome: "Vendas Novas",
    ativo: true,
    stages: [
      { id: "s1", nome: "Novo Lead Qualificado", cor: "#3B82F6", ordem: 1, probabilidade: 10, probabilidadeOriginal: 10 },
      { id: "s2", nome: "Diagnóstico Agendado", cor: "#6366F1", ordem: 2, probabilidade: 15, probabilidadeOriginal: 15 },
      { id: "s3", nome: "Diagnóstico Realizado", cor: "#8B5CF6", ordem: 3, probabilidade: 25, probabilidadeOriginal: 25 },
      { id: "s4", nome: "Oportunidade Qualificada", cor: "#A855F7", ordem: 4, probabilidade: 40, probabilidadeOriginal: 40 },
      { id: "s5", nome: "Solução Desenhada", cor: "#EC4899", ordem: 5, probabilidade: 55, probabilidadeOriginal: 55 },
      { id: "s6", nome: "Proposta Apresentada", cor: "#F97316", ordem: 6, probabilidade: 65, probabilidadeOriginal: 65 },
      { id: "s7", nome: "Negociação", cor: "#EAB308", ordem: 7, probabilidade: 75, probabilidadeOriginal: 75 },
      { id: "s8", nome: "Commit / Decisão Iminente", cor: "#22C55E", ordem: 8, probabilidade: 90, probabilidadeOriginal: 90 },
    ],
  },
  {
    id: "2",
    nome: "Expansão de Contas",
    ativo: true,
    stages: [
      { id: "e1", nome: "Oportunidade Identificada", cor: "#14B8A6", ordem: 1, probabilidade: 20, probabilidadeOriginal: 20 },
      { id: "e2", nome: "Discovery Realizado", cor: "#06B6D4", ordem: 2, probabilidade: 40, probabilidadeOriginal: 40 },
      { id: "e3", nome: "Proposta de Expansão", cor: "#F97316", ordem: 3, probabilidade: 60, probabilidadeOriginal: 60 },
      { id: "e4", nome: "Fechamento", cor: "#22C55E", ordem: 4, probabilidade: 85, probabilidadeOriginal: 85 },
    ],
  },
];

export default function ConfigProbabilidade() {
  const [configs, setConfigs] = useState<PipelineConfig[]>(INITIAL_CONFIGS);
  const [selectedPipeline, setSelectedPipeline] = useState("1");
  const [hasChanges, setHasChanges] = useState(false);

  const currentConfig = configs.find((c) => c.id === selectedPipeline);

  const hasValidProgression = useMemo(() => {
    if (!currentConfig) return true;
    for (let i = 1; i < currentConfig.stages.length; i++) {
      if (currentConfig.stages[i].probabilidade <= currentConfig.stages[i - 1].probabilidade) {
        return false;
      }
    }
    return true;
  }, [currentConfig]);

  const handleProbabilityChange = (stageId: string, value: number) => {
    setConfigs(
      configs.map((c) => {
        if (c.id !== selectedPipeline) return c;
        return {
          ...c,
          stages: c.stages.map((s) =>
            s.id === stageId ? { ...s, probabilidade: value } : s
          ),
        };
      })
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!hasValidProgression) {
      toast.error("A probabilidade deve ser crescente entre os estágios");
      return;
    }
    setConfigs(
      configs.map((c) => {
        if (c.id !== selectedPipeline) return c;
        return {
          ...c,
          stages: c.stages.map((s) => ({ ...s, probabilidadeOriginal: s.probabilidade })),
        };
      })
    );
    setHasChanges(false);
    toast.success("Probabilidades salvas com sucesso!");
  };

  const handleReset = () => {
    setConfigs(
      configs.map((c) => {
        if (c.id !== selectedPipeline) return c;
        return {
          ...c,
          stages: c.stages.map((s) => ({ ...s, probabilidade: s.probabilidadeOriginal })),
        };
      })
    );
    setHasChanges(false);
    toast.info("Valores restaurados");
  };

  const handleApplyTemplate = (template: "conservador" | "moderado" | "agressivo") => {
    if (!currentConfig) return;
    const count = currentConfig.stages.length;
    let values: number[];

    if (template === "conservador") {
      values = currentConfig.stages.map((_, i) => Math.round(5 + (i / (count - 1)) * 80));
    } else if (template === "moderado") {
      values = currentConfig.stages.map((_, i) => Math.round(10 + (i / (count - 1)) * 80));
    } else {
      values = currentConfig.stages.map((_, i) => Math.round(20 + (i / (count - 1)) * 75));
    }

    setConfigs(
      configs.map((c) => {
        if (c.id !== selectedPipeline) return c;
        return {
          ...c,
          stages: c.stages.map((s, i) => ({ ...s, probabilidade: values[i] })),
        };
      })
    );
    setHasChanges(true);
    toast.info(`Template ${template} aplicado`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Percent className="w-7 h-7 text-green-400" />
            <h1 className="text-2xl font-bold">Probabilidade por Estágio</h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-10">
            Defina a probabilidade padrão de fechamento para cada estágio do funil
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset} className="border-border">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Pipeline Selector */}
      <div className="flex gap-2">
        {configs.map((c) => (
          <Button
            key={c.id}
            variant={selectedPipeline === c.id ? "default" : "outline"}
            onClick={() => {
              setSelectedPipeline(c.id);
              setHasChanges(false);
            }}
            className={
              selectedPipeline === c.id
                ? "bg-primary hover:bg-primary/90"
                : "border-border text-foreground/80"
            }
          >
            {c.nome}
            <Badge className="ml-2 bg-[#444444] text-gray-200 text-xs">{c.stages.length}</Badge>
          </Button>
        ))}
      </div>

      {/* Validation Warning */}
      {!hasValidProgression && (
        <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            A probabilidade deve ser crescente entre os estágios. Ajuste os valores para que cada estágio tenha uma probabilidade maior que o anterior.
          </p>
        </div>
      )}

      {/* Templates */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground/80">Templates de probabilidade:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyTemplate("conservador")}
                className="border-border text-xs"
              >
                Conservador (5-85%)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyTemplate("moderado")}
                className="border-border text-xs"
              >
                Moderado (10-90%)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyTemplate("agressivo")}
                className="border-border text-xs"
              >
                Agressivo (20-95%)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stages Probability Table */}
      {currentConfig && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {currentConfig.nome}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentConfig.stages.map((stage, idx) => {
              const prevProb = idx > 0 ? currentConfig.stages[idx - 1].probabilidade : 0;
              const isInvalid = idx > 0 && stage.probabilidade <= prevProb;

              return (
                <div key={stage.id} className="space-y-2">
                  <div className="flex items-center gap-4">
                    {/* Stage Info */}
                    <div className="flex items-center gap-3 w-64 flex-shrink-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: stage.cor }}
                      />
                      <div>
                        <span className="text-sm font-medium">{stage.nome}</span>
                        <span className="text-xs text-muted-foreground ml-2">#{stage.ordem}</span>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="flex-1">
                      <Slider
                        value={[stage.probabilidade]}
                        onValueChange={([v]) => handleProbabilityChange(stage.id, v)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-1 w-24 flex-shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={stage.probabilidade}
                        onChange={(e) =>
                          handleProbabilityChange(stage.id, parseInt(e.target.value) || 0)
                        }
                        className={`bg-[#333333] border-border text-center w-16 h-8 text-sm ${
                          isInvalid ? "border-red-500" : ""
                        }`}
                      />
                      <span className="text-muted-foreground text-sm">%</span>
                    </div>

                    {/* Status */}
                    <div className="w-6 flex-shrink-0">
                      {isInvalid ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : stage.probabilidade !== stage.probabilidadeOriginal ? (
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar Visual */}
                  <div className="ml-[17rem] flex-1">
                    <div className="h-2 bg-[#333333] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${stage.probabilidade}%`,
                          backgroundColor: stage.cor,
                        }}
                      />
                    </div>
                  </div>

                  {idx < currentConfig.stages.length - 1 && (
                    <Separator className="bg-[#333333]/50" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Visual Chart */}
      {currentConfig && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Curva de Probabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {currentConfig.stages.map((stage) => (
                <div key={stage.id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-gray-200">{stage.probabilidade}%</span>
                  <div className="w-full relative" style={{ height: "160px" }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-md transition-all duration-500"
                      style={{
                        height: `${(stage.probabilidade / 100) * 160}px`,
                        backgroundColor: stage.cor,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[80px] truncate">
                    {stage.nome}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
