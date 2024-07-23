import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { z } from "zod";
import { useNavigate, useRevalidator } from "@remix-run/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { api_url } from "@/app/root";

export const Payment = z.object({
  id: z.number(),
  eventName: z.string(),
  totalEntriesSum: z.number(),
  createAt: z.string(),
});

export const columns: ColumnDef<z.infer<typeof Payment>>[] = [
  // {
  //   accessorKey: "id",
  //   header: "Id",
  // },
  {
    accessorKey: "eventName",
    header: "Nome do Evento",
  },
  {
    accessorKey: "totalEntriesSum",
    header: "Total de Ingressos",
  },
  {
    accessorKey: "createAt",
    header: "Criado em",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      const navigate = useNavigate();
      const revalidator = useRevalidator();
      const [openAlert, setOpenAlert] = useState(false);
      const [open, setOpen] = useState(false);

      const formSchema = z.object({
        eventName: z.string().min(2, {
          message: "Username must be at least 2 characters.",
        }),
      });

      const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          eventName: "",
        },
      });

      async function deleteItem() {
        const response = await fetch(
          `http://localhost:3333/api/events/${item.id}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          toast.error("Erro ao deletar o evento");
          return;
        }
        if (response.ok) {
          toast.success("Evento deletado com sucesso");
          revalidator.revalidate();
        }
      }

      async function updateEvent(values: z.infer<typeof formSchema>) {
        setOpen(false);

        const response = await fetch(
          `http://localhost:3333/api/events/${item.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventName: values.eventName,
            }),
          },
        );

        if (!response.ok) {
          toast.error("Erro ao atualizar as informações");
          return;
        }
        if (response.ok) {
          toast.success("Informações atualizadas com sucesso");
          revalidator.revalidate();
        }
      }

      return (
        <>
          <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
            <Dialog open={open} onOpenChange={setOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      navigate(`/eventos/${item.id}`);
                    }}
                  >
                    Editar dados das turmas
                  </DropdownMenuItem>

                  <DialogTrigger asChild>
                    <DropdownMenuItem>
                      Editar informações do evento
                    </DropdownMenuItem>
                  </DialogTrigger>

                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem>Deletar</DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Você tem certeza dessa ação?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita e irá deletar todos os dados
                    relacionados a esse item.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={async () => {
                      await deleteItem();
                      setOpenAlert(false);
                    }}
                  >
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>

              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                  <DialogTitle>Editando evento: {item.eventName}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(updateEvent)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="eventName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Evento</FormLabel>
                          <FormControl>
                            <Input placeholder={item.eventName} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Salvar</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </AlertDialog>
        </>
      );
    },
  },
];
