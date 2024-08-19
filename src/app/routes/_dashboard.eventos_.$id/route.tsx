import { DataTable } from "@/components/eventos/data-table";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { json, useLoaderData, useRevalidator } from "@remix-run/react";
import { columns } from "./columns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");

  const api = process.env.API_URL
    ? process.env.API_URL
    : "http://localhost:3333";

  if (!cookieHeader) return redirect("/login");

  const res = await fetch(`${api}/api/events/${params.id}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Cookie: cookieHeader,
    },
  });
  return json({
    data: await res.json(),
    paramId: Number(params.id),
    api,
  });
}

export default function Eventos() {
  const { data, paramId, api } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      className: "",
      soldEntries: 0,
      totalEntries: 0,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    data.soldEntries = Number(data.soldEntries);
    data.totalEntries = Number(data.totalEntries);
    data.eventId = paramId;

    const parsedData = FormSchema.safeParse(data);
    if (!parsedData.success) {
      toast.error(parsedData.error.errors[0].message);
      return;
    }

    const response = await fetch(`${api}/api/events/classes/new-class`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ classInfos: data }),
    });

    if (!response.ok) {
      toast.error("Erro ao criar a turma");
      return;
    }
    if (response.ok) {
      toast.success("Turma criada com sucesso");
      form.reset();
      revalidator.revalidate();
    }
    const json = await response.json();
    console.log(json);
  }

  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col space-y-4 bg-gradient-to-r from-indigo-100 to-violet-100">
      <div className="flex h-14 items-center border-b-2 border-indigo-900/40 px-4 lg:h-[60px] lg:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <span>Evento: {data.nomeEvento[0].eventName}</span>
        </div>
      </div>
      <main className="flex w-full items-center justify-center">
        <div className="w-11/12">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="mb-4 rounded-lg bg-black p-2 text-sm text-white">
                Nova Turma
              </DialogTrigger>
              <DialogContent aria-describedby="description">
                <DialogHeader>
                  <DialogTitle>Nova Turma</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="className"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da turma</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="totalEntries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade de ingressos totais</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              defaultValue={0}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="soldEntries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Quantidade de ingressos vendidos
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              defaultValue={0}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          className="py-2"
                          type="submit"
                          onClick={() => setOpen(false)}
                        >
                          Criar
                        </Button>
                      </DialogClose>
                      <DialogClose className="text-sm">Cancelar</DialogClose>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable pageSize={5} columns={columns} data={data.turmas} />
        </div>
      </main>
    </div>
  );
}

const FormSchema = z.object({
  eventId: z.number(),
  className: z.string().min(2, {
    message: "O nome precisa ter no minimo 2 caracteres.",
  }),
  soldEntries: z.number().min(0, { message: "O valor não pode ser negativo" }),
  totalEntries: z.number().min(0, { message: "O valor não pode ser negativo" }),
});
