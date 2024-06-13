import { useEffect, useState } from "react";
import "./App.css";

interface Livro {
    _id: string;
    titulo: string;
    autor: string;
    isbn: string;
    paginas: number;
    ano: number;
    valor: number;
}

const TAMANHO_PAGINA = 10;

const BotaoPaginacao = ({ onClick, label, disabled, className }: { onClick: () => void; label: string; disabled: boolean; className?: string }) => (
    <button className={`botao-paginacao ${className}`} disabled={disabled} onClick={onClick}>
        {label}
    </button>
);

const Aplicativo = () => {
    const [livros, setLivros] = useState<Livro[]>([]);
    const [totalPaginas, setTotalPaginas] = useState(0);
    const [totalLivros, setTotalLivros] = useState(0);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);

    useEffect(() => {
        buscarDados();
    }, [paginaAtual]);

    const buscarDados = async () => {
        try {
            const [dadosLivros, dadosTotais] = await Promise.all([buscarLivros(paginaAtual), buscarTotalLivros()]);
            setLivros(dadosLivros);
            setTotalLivros(dadosTotais.quantidade);
            calcularTotalPaginas(dadosTotais.quantidade);
        } catch (erro) {
            console.error("Erro ao buscar dados:", erro);
        }
    };

    const buscarLivros = async (pagina: number): Promise<Livro[]> => {
        const resposta = await fetch(`http://localhost:3001/livro/${pagina}`);
        if (!resposta.ok) {
            throw new Error("Falha ao buscar livros");
        }
        return resposta.json();
    };

    const buscarTotalLivros = async () => {
        const resposta = await fetch(`http://localhost:3001/quantidade`);
        if (!resposta.ok) {
            throw new Error("Falha ao buscar o total de livros");
        }
        return resposta.json();
    };

    const calcularTotalPaginas = (total: number) => {
        const numeroPaginas = Math.ceil(total / TAMANHO_PAGINA);
        setTotalPaginas(numeroPaginas);
    };

    const handlePagina = (valor: number) => {
        setPaginaAtual(valor);
        setPaginaSelecionada(valor); // Definindo o botão de página selecionado
    };

    const renderizarNumerosPaginas = () => {
        const totalPaginasParaMostrar = Math.min(totalPaginas, 7);
        const numerosPaginas = [];
        const paginaInicial = Math.max(1, paginaAtual - Math.floor(totalPaginasParaMostrar / 2));
        const paginaFinal = Math.min(totalPaginas, paginaInicial + totalPaginasParaMostrar - 1);

        for (let i = paginaInicial; i <= paginaFinal; i++) {
            numerosPaginas.push(
                <BotaoPaginacao
                    key={i}
                    onClick={() => handlePagina(i)}
                    label={i.toString()}
                    disabled={i === paginaAtual}
                    className={i === paginaSelecionada ? "selecionado" : ""}
                />
            );
        }

        return numerosPaginas;
    };

    return (
        <div className="App">
            <h1>Catálogo de Livros</h1>
            <div className="App-tabela">
                <table>
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>ISBN</th>
                            <th>Páginas</th>
                            <th>Ano</th>
                            <th>Preço</th>
                        </tr>
                    </thead>
                    <tbody>
                        {livros.map((livro: Livro) => (
                            <tr key={livro._id}>
                                <td>{livro.titulo}</td>
                                <td>{livro.autor}</td>
                                <td>{livro.isbn}</td>
                                <td>{livro.paginas}</td>
                                <td>{livro.ano}</td>
                                <td>R$ {livro.valor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="App-paginacao">
                {totalPaginas > 0 && (
                    <div>
                        Mostrando de {(paginaAtual - 1) * TAMANHO_PAGINA + 1} até{" "}
                        {paginaAtual * TAMANHO_PAGINA > totalLivros ? totalLivros : paginaAtual * TAMANHO_PAGINA} de{" "}
                        {totalLivros} livros
                    </div>
                )}
                <BotaoPaginacao
                    onClick={() => setPaginaAtual(1)}
                    label="<<"
                    disabled={paginaAtual <= 1}
                />
                <BotaoPaginacao
                    onClick={() => setPaginaAtual(paginaAtual - 1)}
                    label="<"
                    disabled={paginaAtual <= 1}
                />
                {renderizarNumerosPaginas()}
                <BotaoPaginacao
                    onClick={() => setPaginaAtual(paginaAtual + 1)}
                    label=">"
                    disabled={paginaAtual >= totalPaginas}
                />
                <BotaoPaginacao
                    onClick={() => setPaginaAtual(totalPaginas)}
                    label=">>"
                    disabled={paginaAtual >= totalPaginas}
                />
            </div>
        </div>
    );
};

export default Aplicativo;
