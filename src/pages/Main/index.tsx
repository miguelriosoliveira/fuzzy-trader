import React, { useState, useEffect, ChangeEvent } from 'react';

import {
	CircularProgress,
	InputAdornment,
	OutlinedInput,
	InputLabel,
	FormControl,
	Button,
} from '@material-ui/core';
import Axios from 'axios';
import classnames from 'classnames';

import Wallet, { WalletProps } from '../../components/Wallet';
import { mainAPI } from '../../services/apis/mainAPI';
import { currencyFormatter } from '../../utils/format';

import './styles.scss';

interface CryptoAPIProps {
	[key: string]: {
		last: number;
	};
}

interface CryptoProps {
	symbol: string;
	value: number;
}

interface StockProps {
	symbol: string;
	close: number;
	value: number;
}

// interface TickerAPIProps {
// 	data: Array<{ symbol: string }>;
// }

// interface EodAPIProps {
// 	data: Array<StockProps>;
// }

interface QuantityProps {
	[key: string]: number;
}

const Main: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [money, setMoney] = useState(0);
	const [investValue, setInvestValue] = useState(0);
	const [cryptos, setCryptos] = useState<CryptoProps[]>([]);
	const [stocks, setStocks] = useState<StockProps[]>([]);
	// const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();
	const [cryptoQuantity, setCryptoQuantity] = useState<QuantityProps>({});
	const [stockQuantity, setStockQuantity] = useState<QuantityProps>({});
	const [subtotal, setSubtotal] = useState(0);
	const [wallet, setWallet] = useState<WalletProps>([]);

	useEffect(() => {
		setLoading(true);

		const getBalance = mainAPI.get('balance');
		const getWallet = mainAPI.get('wallet');

		// get bitcoin values
		// blockchainAPI.get('ticker').then(response => setExchangeRates(response.data));
		const getCryptos = Axios.get<CryptoAPIProps>('https://demo6455206.mockable.io/crypto');

		// get stocks
		// marketstackAPI
		// 	.get<TickerAPIProps>('tickers', { params: { limit: 10 } })
		// 	.then(response => {
		// 		const symbols = response.data.data.map(ticker => ticker.symbol).join(',');
		// 		marketstackAPI
		// 			.get<EodAPIProps>('eod/latest', { params: { symbols } })
		// 			.then(response2 => {
		// 				const val = response2.data.data.map(eod => ({ ...eod, value: eod.close }));
		// 				console.log(JSON.stringify(val, null, 4));
		// 				setTickers(response2.data.data.map(eod => ({ ...eod, value: eod.close })));
		// 			});
		// 	});
		const getStocks = Axios.get<StockProps[]>('https://demo6455206.mockable.io/stocks');

		Promise.all([getBalance, getWallet, getCryptos, getStocks])
			.then(([balanceResponse, walletResponse, cryptosResponse, stocksResponse]) => {
				setMoney(balanceResponse.data);
				setWallet(walletResponse.data);

				const cryptosSorted = Object.entries(cryptosResponse.data)
					.map(([symbol, crypto]) => ({
						...crypto,
						symbol: symbol.slice(0, symbol.length - 3),
						value: crypto.last,
					}))
					.sort((a, b) => a.value - b.value);
				setCryptos(cryptosSorted);

				const stocksSorted = stocksResponse.data
					.map(stock => ({ ...stock, value: stock.close }))
					.sort((a, b) => a.value - b.value);
				setStocks(stocksSorted);
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		const cryptoSubtotal = Object.entries(cryptoQuantity).reduce((acc, [symbol, qtd]) => {
			const crypto = cryptos.find(item => item.symbol === symbol) || { value: 0 };
			const sum = qtd * crypto.value;
			return acc + sum;
		}, 0);

		const stocksSubtotal = Object.entries(stockQuantity).reduce((acc, [symbol, qtd]) => {
			const stock = stocks.find(ticker => ticker.symbol === symbol) || { value: 0 };
			const sum = qtd * stock.value;
			return acc + sum;
		}, 0);

		setSubtotal(cryptoSubtotal + stocksSubtotal);
	}, [cryptoQuantity, cryptos, stockQuantity, stocks]);

	function handleChange({ target: { value } }: ChangeEvent<HTMLInputElement>): void {
		const eventValue = Number(value);
		const maxAllowed = Math.min(money, eventValue);
		setInvestValue(maxAllowed);

		// // debounce to get value in bitcoin
		// if (typingTimeout) {
		// 	clearTimeout(typingTimeout);
		// }
		// if (!value) {
		// 	setBitcoinValue(0);
		// 	return;
		// }
		// setTypingTimeout(
		// 	setTimeout(() => {
		// 		blockchainAPI
		// 			.get('tobtc', { params: { currency: 'USD', value } })
		// 			.then(response => setBitcoinValue(response.data));
		// 	}, 500),
		// );
	}

	async function handleBuy(): Promise<void> {
		// adicionar itens selecionados à carteira
		const purchasedCryptos = Object.entries(cryptoQuantity).map(([symbol, quantity]) => {
			const cryptoFound = cryptos.find(crypto => crypto.symbol === symbol);
			return {
				symbol,
				quantity,
				value: cryptoFound?.value || 0,
			};
		});
		const purchasedStocks = Object.entries(stockQuantity).map(([symbol, quantity]) => {
			const stockFound = stocks.find(stock => stock.symbol === symbol);
			return {
				symbol,
				quantity,
				value: stockFound?.value || 0,
			};
		});
		const purchasedAssets = [...purchasedCryptos, ...purchasedStocks];

		// adicionar itens selecionados à carteira DE FATO
		try {
			await mainAPI.post('purchase', purchasedAssets);
		} catch (error) {
			console.error(error);
			return;
		}

		// atualizar itens da carteira no front
		try {
			const response = await mainAPI.get('wallet');
			setWallet(response.data);
		} catch (error) {
			console.error(error);
			return;
		}

		// subtrair subtotal do valor do saldo
		setMoney(money - subtotal);

		// zerar invest value, cryptoQuantity e stockQuantity (subtotal deveria zerar automaticamente)
		setInvestValue(0);
		setCryptoQuantity({});
		setStockQuantity({});
	}

	if (loading) {
		return <CircularProgress className="loading-center" />;
	}

	return (
		<div className="main-component">
			<header>
				<h1>Seu saldo</h1>
				<h2>{currencyFormatter.format(money)}</h2>
			</header>

			<FormControl fullWidth variant="outlined">
				<InputLabel htmlFor="investValue">Quanto deseja aplicar hoje?</InputLabel>
				<OutlinedInput
					id="investValue"
					type="number"
					color="secondary"
					label="Quanto deseja aplicar hoje?"
					placeholder="Invista com sabedoria..."
					value={investValue || ''}
					onChange={handleChange}
					inputProps={{ min: 0, max: money, step: 0.01 }}
					startAdornment={<InputAdornment position="start">$</InputAdornment>}
				/>
			</FormControl>

			<section className="products">
				<div>
					<h3>Criptomoedas</h3>
					<pre>
						{cryptos.map(({ symbol, value }) => {
							const x = investValue - subtotal + value * (cryptoQuantity[symbol] || 0);
							const purchasable = x >= value;
							const max = x / value;

							return (
								<div key={symbol} className="line">
									<span className={classnames({ purchasable })}>
										{`[${symbol.padEnd(4, ' ')}] ${currencyFormatter.format(value)}`}
									</span>
									{purchasable && (
										<input
											type="number"
											step=".01"
											min={0}
											max={max}
											value={cryptoQuantity[symbol] || 0}
											onChange={e => {
												const eventValue = Number(e.target.value);
												const maxAllowed = Math.min(max, eventValue);
												setCryptoQuantity({ ...cryptoQuantity, [symbol]: maxAllowed });
											}}
										/>
									)}
								</div>
							);
						})}
					</pre>
				</div>

				<div>
					<h3>Ações</h3>
					<pre>
						{stocks.map(({ symbol, value }) => {
							const x = investValue - subtotal + value * (stockQuantity[symbol] || 0);
							const purchasable = x >= value;
							const max = Math.floor(x / value);

							return (
								<div key={symbol} className="line">
									<span className={classnames({ purchasable })}>
										{`[${symbol.padEnd(5, ' ')}] ${currencyFormatter.format(value)}`}
									</span>
									{purchasable && (
										<input
											type="number"
											min={0}
											max={max}
											value={stockQuantity[symbol] || 0}
											onChange={e => {
												const eventValue = Number(e.target.value);
												const maxAllowed = Math.min(max, eventValue);
												setStockQuantity({ ...stockQuantity, [symbol]: maxAllowed });
											}}
										/>
									)}
								</div>
							);
						})}
					</pre>
				</div>
			</section>

			<section className="subtotal">
				<h3>Subtotal</h3>
				<code>
					{currencyFormatter.format(subtotal)}

					{subtotal > 0 && (
						<Button variant="contained" color="primary" size="small" onClick={handleBuy}>
							Comprar
						</Button>
					)}
				</code>
			</section>

			<Wallet wallet={wallet} />
		</div>
	);
};

export default Main;
