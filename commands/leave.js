// ping command module to be used in index.js

const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');
const {PermissionsBitField} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Quitter le salon vocal'),
        category: 'music',
    async execute(interaction){
        await interaction.deferReply();
        // check in the db if only admin can use the command
        var voiceconfig = await interaction.client.serversdb.findOne({ id: interaction.guild.id }).select('voiceconfig'); // get the voiceconfig from the database
        voiceconfig = voiceconfig?.voiceconfig;
        if ((voiceconfig?.adminonly || false) == true && !interaction?.member?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            interaction.editReply({ content: 'Seul un administrateur peut utiliser cette commande.', ephemeral: true });
            return;
        } else {
            // detect voice channel
            if(interaction.member.voice.channel){
                try{
                    // leave the voice channel
                    // using mongo
                    try{
                        await interaction.client.serversdb.bulkWrite([
                            interaction.client.bulkutility.setField({
                                'id': guild.id
                            }, {
                                'voiceconfig.playing': false
                            })
                        ])
                    }catch(err){
                        console.log(err);
                    }
                    const connection = getVoiceConnection(interaction.guild.id);
                    if(!connection){
                        await interaction.editReply('Je ne suis pas dans un salon vocal');
                        // save playing using mongo
                        try{
                            await interaction.client.serversdb.bulkWrite([
                                interaction.client.bulkutility.setField({
                                    'id': guild.id
                                }, {
                                    'voiceconfig.playing': false
                                })
                            ])
                        }catch(err){
                            console.log(err);
                        }
                        // get the player from the players map
                        const player = interaction.client.players.get(interaction.guild.id);
                        // stop the player
                        if(player){
                            player.stop();
                        }
                    } else {
                        connection.destroy();
                        // stop discord player and delete the queue
                        await interaction.editReply('La radio a été arrêtée');
                        // get the player from the players map
                        const player = interaction.client.players.get(interaction.guild.id);
                        // stop the player
                        if(player){
                            player.stop();
                            // delete the player from the players map
                            interaction.client.players.delete(interaction.guild.id);
                        }
                    }
                } catch (error){
                    await interaction.editReply('Une erreur est survenue');
                    console.log(error);
                }
            }  else {
                await interaction.editReply('Vous devez être dans un salon vocal');
            }
        }
    }
};