import React from 'react';

import { currencyFormatter, quantityFormatter } from '../../utils/format';

import './styles.scss';

export type WalletProps = Array<{
	symbol: string;
	value: number;
	quantity: number;
}>;

interface Props {
	wallet: WalletProps;
}

const Wallet: React.FC<Props> = ({ wallet }) => {
	// wallet = [
	// 	{ symbol: 'AMAZON', value: 321.54, quantity: 54 },
	// 	{ symbol: 'ZOOM', value: 321.54, quantity: 7 },
	// 	{ symbol: 'PETROBRAS', value: 21.54, quantity: 77899 },
	// 	{ symbol: 'BTC', value: 11889.54, quantity: 0.005896 },
	// ];

	const total = wallet.reduce((acc, { value, quantity }) => acc + value * quantity, 0);

	return (
		<div className="wallet-component">
			<h3>CARTEIRA DE ATIVOS</h3>

			{wallet.map(({ symbol, value, quantity }) => (
				<div key={symbol} className="item">
					<strong className="symbol">{symbol}</strong>

					<div className="value-display">
						Quantidade
						<span className="filler" />
						{quantityFormatter.format(quantity)}
					</div>

					<div className="value-display">
						Valor
						<span className="filler" />
						{currencyFormatter.format(value)}
					</div>
				</div>
			))}

			<footer>
				<h3>TOTAL EM CARTEIRA</h3>
				<span className="filler" />
				<h3>{currencyFormatter.format(total)}</h3>
			</footer>
		</div>
	);
};

export default Wallet;
