import React, { useState, useEffect, ChangeEvent } from 'react';

import {
	CircularProgress,
	InputAdornment,
	OutlinedInput,
	InputLabel,
	FormControl,
} from '@material-ui/core';

import blockchainAPI from '../../services/apis/blockchainAPI';

import './styles.scss';
import marketstackAPI from '../../services/apis/marketstackAPI';

interface ExchangeRateProps {
	[key: string]: {
		last: number;
		symbol: string;
	};
}

interface TickerProps {
	symbol: string;
	value: number;
	close: number;
}

interface TickerAPIProps {
	data: Array<{ symbol: string }>;
}

interface EodProps {
	data: Array<{
		symbol: string;
		close: number;
	}>;
}

const Main: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [money, setMoney] = useState<number>(123456.78);
	const [investValue, setInvestValue] = useState<number>();
	const [exchangeRates, setExchangeRates] = useState<ExchangeRateProps>({});
	const [bitcoinValue, setBitcoinValue] = useState();
	const [tickers, setTickers] = useState<TickerProps[]>([]);

	useEffect(() => {
		setLoading(true);

		blockchainAPI
			.get('ticker')
			.then(response => setExchangeRates(response.data))
			.finally(() => setLoading(false));

		marketstackAPI
			.get<TickerAPIProps>('tickers', { params: { limit: 10 } })
			.then(response => {
				const symbols = response.data.data.map(ticker => ticker.symbol).join(',');
				console.log(symbols);
				marketstackAPI
					.get<EodProps>('eod/latest', { params: { symbols } })
					.then(response2 => {
						setTickers(response2.data.data.map(eod => ({ ...eod, value: eod.close })));
					});
			});
	}, []);

	async function handleChange({ target: { value } }: ChangeEvent<HTMLInputElement>): Promise<void> {
		setInvestValue(Number(value));

		const bcResponse = await blockchainAPI.get('tobtc', { params: { currency: 'USD', value } });
		setBitcoinValue(bcResponse.data);

		// const msResponse = await marketstackAPI.get('tickers/AAPL/eod/latest');
		// setBitcoinValue(msResponse.data);
	}

	if (loading) {
		return <CircularProgress />;
	}

	return (
		<div className="main-component">
			<header>
				<h1>Sua carteira</h1>
				<h2>{`$ ${money}`}</h2>
			</header>

			<FormControl fullWidth variant="outlined">
				<InputLabel htmlFor="outlined-adornment-amount">Quanto deseja aplicar hoje?</InputLabel>
				<OutlinedInput
					id="outlined-adornment-amount"
					type="number"
					label="Quanto deseja aplicar hoje?"
					placeholder="Invista com sabedoria"
					value={investValue || ''}
					onChange={handleChange}
					inputProps={{ min: 1, max: money }}
					startAdornment={<InputAdornment position="start">$</InputAdornment>}
				/>
			</FormControl>

			{!!investValue && !!bitcoinValue && (
				<section>
					<h3>Valor em bitcoin:</h3>
					<span>{bitcoinValue}</span>
				</section>
			)}

			<section className="codes">
				<div>
					<h3>Câmbio mais recente de Bitcoin (BTC)</h3>
					<code>
						{Object.entries(exchangeRates).map(([currency, { last, symbol }]) => {
							return <pre key={currency}>{`[${currency}] ${symbol.padStart(3, ' ')} ${last}`}</pre>;
						})}
					</code>
				</div>
				<div>
					<h3>Câmbio mais recente de Ações</h3>
					<code>
						{tickers.map(({ symbol, value }) => {
							return <pre key={symbol}>{`[USD] ${symbol.padEnd(5, ' ')} $ ${value}`}</pre>;
						})}
					</code>
				</div>
			</section>
		</div>
	);
};

export default Main;
