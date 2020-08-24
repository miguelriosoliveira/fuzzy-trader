# fuzzy-trader

Front-end feito com ReactJS e fazendo uso de alguns items do [Meterial-UI](https://material-ui.com/).

O servidor [fuzzy-trader-server](https://github.com/miguelriosoliveira/fuzzy-trader-server) é parte fundamental para que este projeto funcione corretamente. Assim como a API [CoinAPI](https://www.coinapi.io/).

## Principais responsabilidades

1. Buscar 10 criptomoedas (escolhidas arbitrariamente para este teste) da CoinAPI (nomes, símbolos, ícones e preços)
1. Buscar 10 ações (escolhidas arbitrariamente para este teste) do fuzzy-trader-server (que, por sua vez, redireciona a busca para a API [marketstack](https://marketstack.com/), retornando também nomes, símbolos e preços).
1. Permitir inserção de valor (em dólar) disponível para compra de ativos disponíveis.
1. Permitir seleção de número de ações e frações de criptomoedas, limitando ao valor inserido anteriormente.
1. Permitir compra dos valores selecionados e persistir na carteira.

## Limitações

Como não há separação por usuários, existe apenas uma única carteira em todo o sistema, o que implica que todos os acessos feitos a este front-end resultaram em ver a mesma carteira, mesmo que esta tenha sido modificada por outra pessoa anteriormente.
