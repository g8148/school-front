import { DataTable } from "@/components/eventos/data-table";
import { columns } from "./columns";
import {
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";

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

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");

  const api = process.env.API_URL
    ? process.env.API_URL
    : "http://localhost:3333";

  if (!cookieHeader) return redirect("/login");

  const res = await fetch(`${api}/api/events`, {
    method: "GET",
    credentials: "include",
    headers: {
      Cookie: cookieHeader,
    },
  });
  return json({ data: await res.json(), api });
};

export default function Eventos() {
  const { data, api } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      eventName: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const parsedData = FormSchema.safeParse(data);
    if (!parsedData.success) {
      toast.error(parsedData.error.errors[0].message);
      return;
    }

    const response = await fetch(`${api}/api/events/new-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ eventInfos: data }),
    });

    if (!response.ok) {
      toast.error("Erro ao criar o evento");
      return;
    }
    if (response.ok) {
      toast.success("Evento criado com sucesso");
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
          <span>Eventos</span>
        </div>
      </div>
      <main className="flex w-full items-center justify-center">
        <div className="w-11/12">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="mb-4 rounded-lg bg-black p-2 text-sm text-white">
                Novo Evento
              </DialogTrigger>
              <DialogContent aria-describedby="description">
                <DialogHeader>
                  <DialogTitle>Novo evento</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="eventName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do evento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        className="py-2"
                        type="submit"
                        onClick={() => setOpen(false)}
                      >
                        Criar
                      </Button>
                      <DialogClose className="text-sm">Cancelar</DialogClose>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <DataTable pageSize={5} columns={columns} data={data} />
        </div>
      </main>
    </div>
  );
}

const FormSchema = z.object({
  eventName: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});
