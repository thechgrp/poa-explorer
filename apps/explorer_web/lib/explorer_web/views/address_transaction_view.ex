defmodule ExplorerWeb.AddressTransactionView do
  use ExplorerWeb, :view

  alias Explorer.Chain.{Transaction}

  import ExplorerWeb.AddressView,
    only: [contract?: 1, smart_contract_verified?: 1, smart_contract_with_read_only_functions?: 1]

  def format_current_filter(filter) do
    case filter do
      "to" -> gettext("To")
      "from" -> gettext("From")
      _ -> gettext("All")
    end
  end

  def address_sending_and_receiving_tokens?(%Transaction{} = transaction, address_hash) do
    address_receiving_tokens?(transaction, address_hash) && address_sending_tokens?(transaction, address_hash)
  end

  def address_receiving_tokens?(%Transaction{token_transfers: token_transfers}, address_hash) do
    Enum.any?(token_transfers, &(&1.to_address_hash == address_hash))
  end

  def address_sending_tokens?(%Transaction{token_transfers: token_transfers}, address_hash) do
    Enum.any?(token_transfers, &(&1.from_address_hash == address_hash))
  end

  def transfered_value?(%Explorer.Chain.Wei{value: value}) do
    Decimal.to_integer(value) != 0
  end
end
