// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prout')
        .setDescription('Incroyable !')
        .addSubcommandGroup(group => group
            .setName('type')
            .setDescription('Si vous voulez un prout normal ou en anglais')
            .addSubcommand(subcommand => subcommand
                .setName('normal')
                .setDescription('Un prout normal')
                .addStringOption(option => option
                    .setName('texte')
                    .setDescription('Le texte que vous voulez mettre après le prout')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('fart')
                .setDescription('Un prout en anglais')
                .addStringOption(option => option
                    .setName('text')
                    .setDescription('Le texte que vous voulez mettre après le prout, speak english please')
                    .setRequired(true)
                )
            )
        )
        .addSubcommandGroup(group => group
            .setName('volume')
            .setDescription('Si vous voulez un prout qui fait beaucoup de bruit ou pas')
            .addSubcommand(subcommand => subcommand
                .setName('fort')
                .setDescription('Un prout qui fait beaucoup de bruit, reveillera tout le monde')
            )
            .addSubcommand(subcommand => subcommand
                .setName('faible')
                .setDescription('Un prout qui fait peu de bruit, personne ne le remarquera')
            )
        ),
    category: 'incroyable',
    async execute(interaction){
        await interaction.deferReply();
        // retrouve le type de prout
        var type = interaction.options.getSubcommandGroup();
        if(type == 'type'){
            type = interaction.options.getSubcommand();
            if(type == 'fart'){
                return await interaction.editReply('Fart ! ' + interaction.options.getString('text'));
            }
            if(type == 'normal'){
                return await interaction.editReply('Prout ! ' + interaction.options.getString('texte'));
            }
        }
        // retrouve le volume du prout
        if(type == 'volume'){
            type = interaction.options.getSubcommand();
            if(type == 'fort'){
                return await interaction.editReply('Prout !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            }
            if(type == 'faible'){
                return await interaction.editReply('Prout.');
            }
        }
    }
};