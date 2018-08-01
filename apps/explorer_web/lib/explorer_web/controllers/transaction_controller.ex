defmodule ExplorerWeb.TransactionController do
  use ExplorerWeb, :controller

  import ExplorerWeb.Chain, only: [paging_options: 1, next_page_params: 3, split_list_by_page: 1]

  alias Explorer.Chain

  def index(conn, params) do
    full_options =
      Keyword.merge(
        [
          necessity_by_association: %{
            block: :required,
            from_address: :optional,
            to_address: :optional
          }
        ],
        paging_options(params)
      )

    transactions_plus_one = Chain.recent_collated_transactions(full_options)

    {transactions, next_page} = split_list_by_page(transactions_plus_one)

    transaction_estimated_count = Chain.transaction_estimated_count()

    render(
      conn,
      "index.html",
      next_page_params: next_page_params(next_page, transactions, params),
      transaction_estimated_count: transaction_estimated_count,
      transactions: transactions
    )
  end

  # Redirects to Token Transfers controller if the transaction has tokens transferred. Otherwise, redirects to Internal Transactions controller.
  def show(conn, %{"id" => id, "locale" => locale}) do
    with {:ok, transaction_hash} <- Chain.string_to_transaction_hash(id),
         {:ok, transaction} <-
           Chain.hash_to_transaction(transaction_hash, necessity_by_association: %{token_transfers: :optional}) do
      case Enum.count(transaction.token_transfers) do
        0 -> redirect(conn, to: transaction_internal_transaction_path(conn, :index, locale, id))
        _ -> redirect(conn, to: transaction_token_transfer_path(conn, :index, locale, id))
      end
    else
      :error ->
        not_found(conn)

      {:error, :not_found} ->
        not_found(conn)
    end
  end
end
