import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

// Register fonts if needed
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
// });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2 solid #000',
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        padding: 8,
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#bfbfbf',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#bfbfbf',
        minHeight: 30,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#e0e0e0',
        fontWeight: 'bold',
    },
    tableCol1: {
        width: '5%',
        borderRightWidth: 1,
        borderRightColor: '#bfbfbf',
        padding: 5,
    },
    tableCol2: {
        width: '25%',
        borderRightWidth: 1,
        borderRightColor: '#bfbfbf',
        padding: 5,
    },
    tableCol3: {
        width: '20%',
        borderRightWidth: 1,
        borderRightColor: '#bfbfbf',
        padding: 5,
    },
    tableCol4: {
        width: '15%',
        borderRightWidth: 1,
        borderRightColor: '#bfbfbf',
        padding: 5,
    },
    tableCol5: {
        width: '20%',
        borderRightWidth: 1,
        borderRightColor: '#bfbfbf',
        padding: 5,
    },
    tableCol6: {
        width: '15%',
        padding: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 9,
        color: '#666',
        borderTop: '1 solid #ccc',
        paddingTop: 10,
    },
    badge: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: 2,
        borderRadius: 3,
        fontSize: 8,
        textAlign: 'center',
    },
    inactiveBadge: {
        backgroundColor: '#999',
    },
});

interface Player {
    id: string;
    gamerTag: string;
    role?: string;
    rank?: string;
    eligibility?: string;
    isActive: boolean;
    orgUser?: {
        displayName: string;
        email: string;
    };
    teamMember?: {
        isStarter: boolean;
        position?: string;
    };
}

interface Team {
    name: string;
    game: string;
    season?: string;
    status: string;
    members?: Array<{
        isStarter: boolean;
        position?: string;
        player: Player;
    }>;
}

interface RosterSheetPDFProps {
    team: any; // Accept any team type to avoid strict type checking issues
    organizationName: string;
}

export const RosterSheetPDF = ({ team, organizationName }: RosterSheetPDFProps) => {
    const starters = team.members?.filter(m => m.isStarter) || [];
    const bench = team.members?.filter(m => !m.isStarter) || [];
    const allMembers = [...starters, ...bench];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{team.name} - Roster Sheet</Text>
                    <Text style={styles.subtitle}>{organizationName}</Text>
                    <Text style={styles.subtitle}>
                        {team.game}
                        {team.season && ` • ${team.season}`}
                        {' • '}
                        Status: {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                    </Text>
                    <Text style={styles.subtitle}>
                        Generated: {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>

                {/* Current Players */}
                {starters.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Current Players ({starters.length})</Text>
                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={styles.tableCol1}>#</Text>
                                <Text style={styles.tableCol2}>Gamer Tag</Text>
                                <Text style={styles.tableCol3}>Name</Text>
                                <Text style={styles.tableCol4}>Position</Text>
                                <Text style={styles.tableCol5}>Role/Rank</Text>
                                <Text style={styles.tableCol6}>Status</Text>
                            </View>
                            {/* Table Rows */}
                            {starters.map((member, index) => (
                                <View key={member.player.id} style={styles.tableRow}>
                                    <Text style={styles.tableCol1}>{index + 1}</Text>
                                    <Text style={styles.tableCol2}>{member.player.gamerTag}</Text>
                                    <Text style={styles.tableCol3}>
                                        {member.player.orgUser?.displayName || '-'}
                                    </Text>
                                    <Text style={styles.tableCol4}>{member.position || '-'}</Text>
                                    <Text style={styles.tableCol5}>
                                        {member.player.role || member.player.rank || '-'}
                                    </Text>
                                    <Text style={styles.tableCol6}>
                                        {member.player.isActive ? 'Active' : 'Inactive'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Subs (Substitutes) */}
                {bench.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Subs (Substitutes) ({bench.length})</Text>
                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={styles.tableCol1}>#</Text>
                                <Text style={styles.tableCol2}>Gamer Tag</Text>
                                <Text style={styles.tableCol3}>Name</Text>
                                <Text style={styles.tableCol4}>Position</Text>
                                <Text style={styles.tableCol5}>Role/Rank</Text>
                                <Text style={styles.tableCol6}>Status</Text>
                            </View>
                            {/* Table Rows */}
                            {bench.map((member, index) => (
                                <View key={member.player.id} style={styles.tableRow}>
                                    <Text style={styles.tableCol1}>{index + 1}</Text>
                                    <Text style={styles.tableCol2}>{member.player.gamerTag}</Text>
                                    <Text style={styles.tableCol3}>
                                        {member.player.orgUser?.displayName || '-'}
                                    </Text>
                                    <Text style={styles.tableCol4}>{member.position || '-'}</Text>
                                    <Text style={styles.tableCol5}>
                                        {member.player.role || member.player.rank || '-'}
                                    </Text>
                                    <Text style={styles.tableCol6}>
                                        {member.player.isActive ? 'Active' : 'Inactive'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Roster Summary</Text>
                    <Text>Total Players: {allMembers.length}</Text>
                    <Text>Current Players: {starters.length}</Text>
                    <Text>Subs: {bench.length}</Text>
                    <Text>
                        Active Players: {allMembers.filter(m => m.player.isActive).length}
                    </Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    This roster sheet was generated by {organizationName} Esports Operations Platform
                </Text>
            </Page>
        </Document>
    );
};
