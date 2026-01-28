import ButtonList from './ButtonList.jsx';

export default function CentredBlock() {
    return (
        <div className="c-centred-block" alpine:style={`{ 
            backgroundImage: 'url(' + block.background_image + ')',
            '--centred-block-background-light': block.light_mode_background_color,
            '--centred-block-background-dark': block.dark_mode_background_color,
            '--centred-block-text-light': block.light_mode_text_color,
            '--centred-block-text-dark': block.dark_mode_text_color
        }`}>
            <div className="c-centred-block__inner">
                <h2 x-text="block.heading"></h2>
                <p x-html="block.description"></p>
                <div>
                    <ButtonList />
                </div>
            </div>
        </div>
    );
}
