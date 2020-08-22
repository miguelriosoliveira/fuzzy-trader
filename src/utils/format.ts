export const numberFormatter = new Intl.NumberFormat('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export const quantityFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 20 });

export const currencyFormatter = {
	format: (value: number): string => `$ ${numberFormatter.format(value)}`,
};
