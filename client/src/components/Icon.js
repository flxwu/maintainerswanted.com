import React from 'react';

const IconURI = title => `../assets/icons/${title}.svg`;

const Icon = props => (
	<img src={IconURI(props.type)} width={50} height={50} />
);

export default Icon;
