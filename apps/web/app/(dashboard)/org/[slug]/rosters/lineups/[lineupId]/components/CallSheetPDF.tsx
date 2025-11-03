import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

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
        minHeight: 35,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#e0e0e0',
        fontWeight: 'bold',
    },
    tableCol1: {
        width: '8%',
        borderRightWidth: 1,
        borderRightColor: '#bfbfbf',
        padding: 5,
    },
    tableCol2: {
        width: '22%',
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
    infoBox: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        marginTop: 10,
        border: '1 solid #ccc',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    infoLabel: {
        fontWeight: 'bold',
        width: '30%',
    },
    infoValue: {
        width: '70%',
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
    statusBadge: {
        padding: 3,
        borderRadius: 3,
        fontSize: 9,
        textAlign: 'center',
    },
    publishedBadge: {
        backgroundColor: '#4CAF50',
        color: 'white',
    },
    draftBadge: {
        backgroundColor: '#FFC107',
        color: 'black',
    },
    notes: {
        fontSize: 9,
        fontStyle: 'italic',
        color: '#666',
        marginTop: 2,
    },
});

interface LineupSlot {
    id: string;
    playerId: string | null;
    role: string;
    isSub: boolean;
    notes?: string;
    player?: {
        id: string;
        gamerTag: string;
        role?: string;
        rank?: string;
        eligibility?: string;
        mainsJson?: string[];
        orgUser?: {
            displayName: string;
            email: string;
        };
    };
}

interface Lineup {
    id: string;
    title?: string;
    published: boolean;
    createdAt: string;
    team: {
        name: string;
        game: string;
        season?: string;
    };
    slots: LineupSlot[];
}

interface CallSheetPDFProps {
    lineup: any; // Accept any lineup type to avoid strict type checking issues
    organizationName: string;
    eventName?: string;
    eventDate?: string;
}

export const CallSheetPDF = ({ lineup, organizationName, eventName, eventDate }: CallSheetPDFProps) => {
    const starters = lineup.slots.filter(s => !s.isSub && s.player);
    const subs = lineup.slots.filter(s => s.isSub && s.player);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {lineup.title || 'Event Lineup'} - Call Sheet
                    </Text>
                    <Text style={styles.subtitle}>{organizationName}</Text>
                    <Text style={styles.subtitle}>
                        {lineup.team.name} • {lineup.team.game}
                        {lineup.team.season && ` • ${lineup.team.season}`}
                    </Text>
                    <Text style={styles.subtitle}>
                        Status: {lineup.published ? 'Published' : 'Draft'}
                    </Text>
                </View>

                {/* Event Information */}
                {(eventName || eventDate) && (
                    <View style={styles.infoBox}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Event Information</Text>
                        {eventName && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Event:</Text>
                                <Text style={styles.infoValue}>{eventName}</Text>
                            </View>
                        )}
                        {eventDate && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Date:</Text>
                                <Text style={styles.infoValue}>{eventDate}</Text>
                            </View>
                        )}
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Generated:</Text>
                            <Text style={styles.infoValue}>
                                {new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Starting Lineup */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Starting Lineup ({starters.length})</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <Text style={styles.tableCol1}>#</Text>
                            <Text style={styles.tableCol2}>Gamer Tag</Text>
                            <Text style={styles.tableCol3}>Player Name</Text>
                            <Text style={styles.tableCol4}>Role</Text>
                            <Text style={styles.tableCol5}>Rank/Mains</Text>
                            <Text style={styles.tableCol6}>Eligibility</Text>
                        </View>
                        {/* Table Rows */}
                        {starters.map((slot, index) => (
                            <View key={slot.id}>
                                <View style={styles.tableRow}>
                                    <Text style={styles.tableCol1}>{index + 1}</Text>
                                    <Text style={styles.tableCol2}>
                                        {slot.player?.gamerTag || 'Unassigned'}
                                    </Text>
                                    <Text style={styles.tableCol3}>
                                        {slot.player?.orgUser?.displayName || '-'}
                                    </Text>
                                    <Text style={styles.tableCol4}>{slot.role || '-'}</Text>
                                    <Text style={styles.tableCol5}>
                                        {slot.player?.rank ||
                                            (slot.player?.mainsJson?.slice(0, 2).join(', ')) ||
                                            '-'}
                                    </Text>
                                    <Text style={styles.tableCol6}>
                                        {slot.player?.eligibility || 'eligible'}
                                    </Text>
                                </View>
                                {slot.notes && (
                                    <View style={{ paddingLeft: 10, paddingBottom: 5 }}>
                                        <Text style={styles.notes}>Notes: {slot.notes}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Substitutes */}
                {subs.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Substitutes ({subs.length})</Text>
                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={styles.tableCol1}>#</Text>
                                <Text style={styles.tableCol2}>Gamer Tag</Text>
                                <Text style={styles.tableCol3}>Player Name</Text>
                                <Text style={styles.tableCol4}>Role</Text>
                                <Text style={styles.tableCol5}>Rank/Mains</Text>
                                <Text style={styles.tableCol6}>Eligibility</Text>
                            </View>
                            {/* Table Rows */}
                            {subs.map((slot, index) => (
                                <View key={slot.id}>
                                    <View style={styles.tableRow}>
                                        <Text style={styles.tableCol1}>{index + 1}</Text>
                                        <Text style={styles.tableCol2}>
                                            {slot.player?.gamerTag || 'Unassigned'}
                                        </Text>
                                        <Text style={styles.tableCol3}>
                                            {slot.player?.orgUser?.displayName || '-'}
                                        </Text>
                                        <Text style={styles.tableCol4}>{slot.role || '-'}</Text>
                                        <Text style={styles.tableCol5}>
                                            {slot.player?.rank ||
                                                (slot.player?.mainsJson?.slice(0, 2).join(', ')) ||
                                                '-'}
                                        </Text>
                                        <Text style={styles.tableCol6}>
                                            {slot.player?.eligibility || 'eligible'}
                                        </Text>
                                    </View>
                                    {slot.notes && (
                                        <View style={{ paddingLeft: 10, paddingBottom: 5 }}>
                                            <Text style={styles.notes}>Notes: {slot.notes}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lineup Summary</Text>
                    <Text>Starting Players: {starters.length}</Text>
                    <Text>Substitutes: {subs.length}</Text>
                    <Text>Total: {starters.length + subs.length}</Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    This call sheet was generated by {organizationName} Esports Operations Platform
                </Text>
            </Page>
        </Document>
    );
};
