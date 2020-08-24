import React, { ChangeEvent } from 'react';

import classnames from 'classnames';

import { QuantityProps, CryptoProps } from '../../Interfaces';
import { currencyFormatter } from '../../utils/format';

interface Props {
	title: string;
	cryptos: CryptoProps[];
	investValue: number;
	subtotal: number;
	quantityObject: QuantityProps;
	handleChangeQuantity: (max: number, symbol: string) => (e: ChangeEvent<HTMLInputElement>) => void;
}

const CryptosMenu: React.FC<Props> = ({
	title,
	cryptos,
	investValue,
	subtotal,
	quantityObject,
	handleChangeQuantity,
}) => {
	const longestSymbolAsset = [...cryptos].sort((a, b) => b.symbol.length - a.symbol.length)[0];

	return (
		<div>
			<h3>{title}</h3>
			<pre>
				{cryptos.map(({ symbol, value, icon_url, name }) => {
					// naming is a difficult task...
					const x = investValue - subtotal + value * (quantityObject[symbol] || 0);
					const purchasable = x >= value * 0.01;
					const max = x / value;
					const symbolFormatted = symbol.padEnd(longestSymbolAsset.symbol.length, ' ');
					const valueFormatted = currencyFormatter.format(value);

					return (
						<div key={symbol} className="line">
							<span title={name} className={classnames({ purchasable })}>
								<img src={icon_url} alt={`${name} icon`} />
								{`[${symbolFormatted}] ${valueFormatted}`}
							</span>

							{purchasable && (
								<input
									type="number"
									step=".01"
									min={0}
									max={max}
									value={quantityObject[symbol] || 0}
									onChange={handleChangeQuantity(max, symbol)}
								/>
							)}
						</div>
					);
				})}
			</pre>
		</div>
	);
};

export default CryptosMenu;
