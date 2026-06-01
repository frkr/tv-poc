import React, { useState } from "react";
import { useLoaderData, Form, useNavigation } from "react-router";
import type { Categoria } from "../lib/database";

export default function Categorias() {
    const { categorias } = useLoaderData() as { categorias: Categoria[] };
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);

    const handleEdit = (categoria: Categoria) => {
        setEditingCategoria(categoria);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => setEditingCategoria(null);

    return (
        <div className="bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Gerenciar Categorias</h1>

            <Form method="post" className="mb-8 p-4 border rounded bg-gray-50" onSubmit={() => setTimeout(() => setEditingCategoria(null), 100)}>
                <h2 className="text-lg font-semibold mb-4">{editingCategoria ? "Editar Categoria" : "Nova Categoria"}</h2>
                <input type="hidden" name="intent" value={editingCategoria ? "update" : "create"} />
                {editingCategoria && <input type="hidden" name="id" value={editingCategoria.id} />}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Nome da Categoria</label>
                        <input
                            required
                            type="text"
                            name="categoria"
                            defaultValue={editingCategoria?.categoria}
                            key={editingCategoria?.id ?? "new"}
                            className="w-full p-2 border rounded"
                            placeholder="Ex: Programação, Design, Marketing..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <button disabled={isSubmitting} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                            {isSubmitting ? "Salvando..." : (editingCategoria ? "Salvar" : "Criar")}
                        </button>
                        {editingCategoria && (
                            <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </Form>

            <h2 className="text-xl font-bold mb-4">Lista de Categorias</h2>
            {categorias.length === 0 ? (
                <p className="text-gray-500">Nenhuma categoria cadastrada.</p>
            ) : (
                <div className="space-y-2">
                    {categorias.map((cat) => (
                        <div key={cat.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                            <span className="font-medium">{cat.categoria}</span>
                            <div className="flex gap-4">
                                <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800 font-medium">
                                    Editar
                                </button>
                                <Form method="post" onSubmit={(e) => { if (!confirm(`Excluir "${cat.categoria}"?`)) e.preventDefault(); }}>
                                    <input type="hidden" name="intent" value="delete" />
                                    <input type="hidden" name="id" value={cat.id} />
                                    <button type="submit" className="text-red-600 hover:text-red-800 font-medium">Excluir</button>
                                </Form>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
