export const ECOSYSTEM = {
    folio: {
        label: 'Folio',
        href: 'https://alexander.xin/',
        title: '主站：摄影、写作、研究',
    },
    netq: {
        label: 'netq',
        href: 'https://netq.alexander.xin/',
        title: '交互式网络排查 CLI',
    },
    tools: {
        label: 'IT-Tools',
        href: 'https://tools.alexander.xin/',
        title: '常用小工具箱',
    },
} as const;

const NETQ_RELATED = new Set([
    'curl',
    'dig',
    'host',
    'ifconfig',
    'ip',
    'iptables',
    'nc',
    'netstat',
    'nmap',
    'nslookup',
    'ping',
    'ping6',
    'ss',
    'ssh',
    'tcpdump',
    'traceroute',
    'wget',
]);

export function suggestsNetq(commandName: string): boolean {
    return NETQ_RELATED.has(commandName);
}
