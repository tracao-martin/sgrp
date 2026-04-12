import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

const eventos = [
  { date: "11", type: "reuniao", title: "Call com Acme Corp", time: "14:30" },
  { date: "12", type: "email", title: "Proposta enviada", time: "09:15" },
  { date: "13", type: "whatsapp", title: "Seguimento com cliente", time: "16:00" },
  { date: "15", type: "tarefa", title: "Preparar proposta", time: "10:00" },
];

const eventColors = {
  reuniao: "bg-primary",
  email: "bg-purple-500",
  whatsapp: "bg-green-500",
  tarefa: "bg-orange-500",
  ligacao: "bg-red-500",
};

const eventLabels = {
  reuniao: "Reunião",
  email: "Email",
  whatsapp: "WhatsApp",
  tarefa: "Tarefa",
  ligacao: "Ligação",
};

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 11)); // April 11, 2026

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventosForDay = (day: number) => {
    return eventos.filter((e) => parseInt(e.date) === day);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Calendário</h1>
          <p className="text-muted-foreground mt-1">Visualize suas atividades e agendamentos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="p-2 hover:bg-[#333333] rounded">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-[#333333] rounded">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty days */}
                {emptyDays.map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days with events */}
                {days.map((day) => {
                  const dayEventos = getEventosForDay(day);
                  const isToday = day === 11;

                  return (
                    <div
                      key={day}
                      className={`aspect-square p-2 rounded-lg border-2 transition-colors ${
                        isToday
                          ? "border-primary bg-primary/15"
                          : dayEventos.length > 0
                            ? "border-border bg-[#333333]/50"
                            : "border-border bg-card"
                      } hover:border-primary/40`}
                    >
                      <div className="text-sm font-medium mb-1">{day}</div>
                      <div className="space-y-1">
                        {dayEventos.slice(0, 2).map((evento, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-1 py-0.5 rounded text-white truncate ${
                              eventColors[evento.type as keyof typeof eventColors]
                            }`}
                          >
                            {evento.title}
                          </div>
                        ))}
                        {dayEventos.length > 2 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{dayEventos.length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Próximos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventos.map((evento, idx) => (
                  <div key={idx} className="p-3 bg-[#333333] rounded-lg">
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          eventColors[evento.type as keyof typeof eventColors]
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{evento.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {evento.date}/04 às {evento.time}
                        </p>
                        <span className="text-xs bg-[#444444] px-2 py-1 rounded mt-2 inline-block">
                          {eventLabels[evento.type as keyof typeof eventLabels]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Legend */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(eventColors).map(([key, color]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-sm text-foreground/80 capitalize">
                  {eventLabels[key as keyof typeof eventLabels]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
