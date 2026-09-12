export interface ColorTheme {
	name: string;
	primary: string;
	secondary: string;
	accent: string;
	bg: string;
	border: string;
	text: string;
}

export const colorThemes: ColorTheme[] = [
	{
		name: 'Wine',
		primary: '#9b2335',
		secondary: '#e7e5e4',
		accent: '#b73a4a',
		bg: '#faf8f5',
		border: '#d6d3d1',
		text: '#1c1917'
	},
	{
		name: 'Burgundy',
		primary: '#a00030',
		secondary: '#ede5dc',
		accent: '#b8243a',
		bg: '#fff8f0',
		border: '#d8cfc4',
		text: '#1a0f10'
	},
	{
		name: 'Merlot',
		primary: '#8b3a42',
		secondary: '#e7e0d8',
		accent: '#a04a52',
		bg: '#f5f0eb',
		border: '#d0c9c0',
		text: '#292524'
	},
	{
		name: 'Oxblood',
		primary: '#6b1414',
		secondary: '#e0ddd9',
		accent: '#8b2424',
		bg: '#f0eeec',
		border: '#ccc8c2',
		text: '#2b211e'
	}
];
