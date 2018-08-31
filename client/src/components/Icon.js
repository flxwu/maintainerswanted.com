import React from 'react';

const IconURI = title => `../assets/icons/${title}.svg`;

const Icon = props => (
	<img src={IconURI(props.type)} width={props.width || 50} height={props.height || 50} />
);

export default Icon;
