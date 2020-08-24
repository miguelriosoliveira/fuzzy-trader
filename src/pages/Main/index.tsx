import React, { useState, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';

import {
	CircularProgress,
	InputAdornment,
	OutlinedInput,
	InputLabel,
	FormControl,
	Button,
} from '@material-ui/core';

import ConfirmationDialog from '../../components/ConfirmationDialog';
import CryptosMenu from '../../components/CryptosMenu';
import StocksMenu from '../../components/StocksMenu';
import Wallet, { WalletProps } from '../../components/Wallet';
import { StockProps, CryptoProps, QuantityProps } from '../../Interfaces';
import { mainAPI, coinAPI, marketstackAPI } from '../../services/apis';
import { currencyFormatter } from '../../utils/format';

import './styles.scss';

type CoinAPIAssetProps = Array<{
	asset_id: string;
	name: string;
	type_is_crypto: 0 | 1;
	price_usd: number;
}>;

type CoinAPIIconProps = Array<{
	asset_id: string;
	url: string;
}>;

interface SaveCryptoProps {
	cryptoList: CoinAPIAssetProps;
	iconList: CoinAPIIconProps;
}

interface SaveStockProps {
	stockList: StockProps[];
	namesList: StockProps[];
}

const CRYPTOS_KEY = '@fuzzy-trader:cryptos';
const CRYPTO_ICONS_KEY = '@fuzzy-trader:crypto-icons';
const STOCKS_KEY = '@fuzzy-trader:stocks';
const STOCK_NAMES_KEY = '@fuzzy-trader:stock-names';
const WANTED_CRYPTOS = ['BTC', 'ETH', 'XRP', 'BOT', 'LTC', '42', 'BCC', 'XIN', 'BCH', 'XMR'];
const WANTED_STOCKS = ['DIS', 'TWTR', 'ZM', 'UBER', 'MSFT', 'FB', 'AAPL', 'NFLX', 'GOOG', 'AMZN'];

const Main: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [investValue, setInvestValue] = useState(0);
	const [cryptos, setCryptos] = useState<CryptoProps[]>([]);
	const [stocks, setStocks] = useState<StockProps[]>([]);
	const [cryptoQuantity, setCryptoQuantity] = useState<QuantityProps>({});
	const [stockQuantity, setStockQuantity] = useState<QuantityProps>({});
	const [subtotal, setSubtotal] = useState(0);
	const [wallet, setWallet] = useState<WalletProps>([]);
	const [confirmationOpen, setConfirmationOpen] = useState(false);

	function saveCryptos({ cryptoList, iconList }: SaveCryptoProps): void {
		// crypto prices
		const onlyWantedCrypto = cryptoList
			.filter(asset => WANTED_CRYPTOS.includes(asset.asset_id))
			.map(({ asset_id, name, price_usd }) => ({ asset_id, name, price_usd }))
			.sort((a, b) => a.price_usd - b.price_usd);

		// crypto icons
		const onlyWantedIcons = iconList.filter(icon => WANTED_CRYPTOS.includes(icon.asset_id));
		const cryptoWithIcons = onlyWantedCrypto.map(
			(coin): CryptoProps => {
				const coinIcon = onlyWantedIcons.find(icon => icon.asset_id === coin.asset_id);

				return {
					symbol: coin.asset_id,
					name: coin.name,
					value: coin.price_usd,
					icon_url: coinIcon?.url || '',
				};
			},
		);
		setCryptos(cryptoWithIcons);

		// cache
		localStorage.setItem(CRYPTOS_KEY, JSON.stringify(cryptoList));
		localStorage.setItem(CRYPTO_ICONS_KEY, JSON.stringify(iconList));
	}

	async function getCryptos(): Promise<CoinAPIAssetProps> {
		// get from cache
		const cachedCryptos = localStorage.getItem(CRYPTOS_KEY);
		if (cachedCryptos) {
			// get cached
			return new Promise((resolve, reject) =>
				resolve(JSON.parse(cachedCryptos) as CoinAPIAssetProps),
			);
		}
		// get online
		return coinAPI.get<CoinAPIAssetProps>('assets').then(response => response.data);
	}

	async function getCryptoIcons(): Promise<CoinAPIIconProps> {
		const cachedCryptoIcons = localStorage.getItem(CRYPTO_ICONS_KEY);
		if (cachedCryptoIcons) {
			// get cached
			return new Promise((resolve, reject) =>
				resolve(JSON.parse(cachedCryptoIcons) as CoinAPIIconProps),
			);
		}
		// get online
		return coinAPI.get<CoinAPIIconProps>('assets/icons/32').then(response => response.data);
	}

	function saveStocks({ stockList, namesList }: SaveStockProps): void {
		// almost all stock data
		const stocksSorted = stockList
			.map(stock => ({ ...stock, value: stock.close }))
			.sort((a, b) => a.value - b.value);

		// stock name data
		const stocksWithNames = stocksSorted.map(stock => {
			const stockName = namesList.find(nameData => nameData.symbol === stock.symbol);
			return {
				...stock,
				name: stockName?.name || '',
			};
		});
		setStocks(stocksWithNames);

		// cache
		localStorage.setItem(STOCKS_KEY, JSON.stringify(stockList));
		localStorage.setItem(STOCK_NAMES_KEY, JSON.stringify(namesList));
	}

	async function getStocks(): Promise<StockProps[]> {
		const cachedStocks = localStorage.getItem(STOCKS_KEY);
		if (cachedStocks) {
			// get cached
			return new Promise((resolve, reject) => resolve(JSON.parse(cachedStocks) as StockProps[]));
		}
		// get online
		return marketstackAPI
			.get<{ data: StockProps[] }>('eod/latest', { params: { symbols: WANTED_STOCKS } })
			.then(response => response.data.data);
	}

	async function getStockNames(): Promise<StockProps[]> {
		const cachedStockNames = localStorage.getItem(STOCK_NAMES_KEY);
		if (cachedStockNames) {
			// get cached
			return new Promise((resolve, reject) => {
				return resolve(JSON.parse(cachedStockNames) as StockProps[]);
			});
		}
		// get online
		const getStockNamesCalls = WANTED_STOCKS.map(stockCode => {
			return marketstackAPI.get<StockProps>(`tickers/${stockCode}`).then(response => response.data);
		});
		return Promise.all(getStockNamesCalls);
	}

	const getData = useCallback(() => {
		setLoading(true);

		Promise.all([
			mainAPI.get('wallet').then(response => response.data),
			getCryptos(),
			getCryptoIcons(),
			getStocks(),
			getStockNames(),
		])
			.then(([walletData, cryptoList, iconList, stockList, namesList]) => {
				setWallet(walletData);
				saveCryptos({ cryptoList, iconList });
				saveStocks({ stockList, namesList });
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		getData();
	}, [getData]);

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

	async function handlePurchase(): Promise<void> {
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

		// zerar invest value, cryptoQuantity e stockQuantity (subtotal deveria zerar automaticamente)
		setInvestValue(0);
		setCryptoQuantity({});
		setStockQuantity({});
	}

	function handleClearCache(): void {
		localStorage.clear();
		getData();
	}

	function handleOpenConfirmation(): void {
		setConfirmationOpen(true);
	}

	function handleCloseConfirmation(): void {
		setConfirmationOpen(false);
	}

	function handleChangeInvestValue(e: ChangeEvent<HTMLInputElement>): void {
		setInvestValue(Number(e.target.value));
	}

	function handleKeyDownInvestValue(e: KeyboardEvent): void {
		const invalidChars = ['e', '-', '+'];
		if (invalidChars.includes(e.key)) {
			e.preventDefault();
		}
	}

	if (loading) {
		return <CircularProgress className="loading-center" />;
	}

	return (
		<div className="main-component">
			<header>
				<h1>
					<span>Bem-vindo à </span>
					<i>Crypto &amp; Stocks</i>
				</h1>

				<Button onClick={handleOpenConfirmation}>Apagar cache</Button>
			</header>

			<FormControl fullWidth variant="outlined">
				<InputLabel htmlFor="investValue">Quanto deseja aplicar hoje?</InputLabel>
				<OutlinedInput
					id="investValue"
					type="number"
					label="Quanto deseja aplicar hoje?"
					placeholder="Invista com sabedoria..."
					value={investValue || ''}
					onChange={handleChangeInvestValue}
					onKeyDown={handleKeyDownInvestValue}
					inputProps={{ min: 0, step: 0.01 }}
					startAdornment={<InputAdornment position="start">$</InputAdornment>}
				/>
			</FormControl>

			<section className="products">
				<CryptosMenu
					title="Criptomoedas"
					cryptos={cryptos}
					investValue={investValue}
					subtotal={subtotal}
					quantityObject={stockQuantity}
					handleChangeQuantity={(max, symbol) => e => {
						const eventValue = Number(e.target.value);
						const maxAllowed = Math.min(max, eventValue);
						setCryptoQuantity({ ...cryptoQuantity, [symbol]: maxAllowed });
					}}
				/>

				<StocksMenu
					title="Ações"
					stocks={stocks}
					investValue={investValue}
					subtotal={subtotal}
					quantityObject={stockQuantity}
					handleChangeQuantity={(max, symbol) => e => {
						const eventValue = Number(e.target.value);
						const maxAllowed = Math.min(max, eventValue);
						setStockQuantity({ ...stockQuantity, [symbol]: maxAllowed });
					}}
				/>
			</section>

			<section className="subtotal">
				<h3>Subtotal</h3>
				<code>
					{currencyFormatter.format(subtotal)}

					{subtotal > 0 && (
						<Button variant="contained" color="primary" size="small" onClick={handlePurchase}>
							Comprar
						</Button>
					)}
				</code>
			</section>

			<Wallet wallet={wallet} />

			<ConfirmationDialog
				open={confirmationOpen}
				handleCancel={handleCloseConfirmation}
				handleOk={handleClearCache}
			/>
		</div>
	);
};

export default Main;
