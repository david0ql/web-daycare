import React from "react";
import { List, useTable, DateField, EditButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Tag, Typography, Card, Row, Col, Statistic, Avatar, Tooltip } from "antd";
import { 
  useTodayAttendance, 
  useChildrenWithStatus, 
  useAttendanceStats,
  AttendanceStatus
} from "../../domains/attendance";
import { CheckCircleOutlined, ClockCircleOutlined, UserOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useLanguage } from "../../shared/contexts/language.context";
import { getIntlLocale } from "../../shared/i18n/locale";

const { Title, Text } = Typography;

const ATTENDANCE_LIST_TRANSLATIONS = {
  english: {
    title: "Attendance Record",
    totalChildren: "Total Children",
    presentToday: "Present Today",
    absentToday: "Absent Today",
    attendanceRate: "Attendance Rate",
    child: "Child",
    date: "Date",
    checkIn: "Check-in",
    checkOut: "Check-out",
    status: "Status",
    deliveredBy: "Delivered by",
    pickedUpBy: "Picked up by",
    notes: "Notes",
    actions: "Actions",
    id: "ID",
    absent: "Absent",
    checkedOut: "Checked Out",
    present: "Present",
    recordsOf: "records",
    of: "of",
    notAvailable: "N/A",
  },
  spanish: {
    title: "Registro de asistencia",
    totalChildren: "Total niños",
    presentToday: "Presentes hoy",
    absentToday: "Ausentes hoy",
    attendanceRate: "Tasa de asistencia",
    child: "Niño",
    date: "Fecha",
    checkIn: "Entrada",
    checkOut: "Salida",
    status: "Estado",
    deliveredBy: "Entregado por",
    pickedUpBy: "Recogido por",
    notes: "Notas",
    actions: "Acciones",
    id: "ID",
    absent: "Ausente",
    checkedOut: "Retirado",
    present: "Presente",
    recordsOf: "registros",
    of: "de",
    notAvailable: "N/D",
  },
} as const;

type AttendanceListTranslations = (typeof ATTENDANCE_LIST_TRANSLATIONS)[keyof typeof ATTENDANCE_LIST_TRANSLATIONS];

const AttendanceStatusComponent: React.FC<{ status: AttendanceStatus; t: AttendanceListTranslations }> = ({ status, t }) => {
  const hasCheckIn = !!status.isCheckedIn;
  const hasCheckOut = !!status.isCheckedOut;
  
  if (!hasCheckIn) {
    return (
      <Tag color="red" icon={<CloseCircleOutlined />}>
        {t.absent}
      </Tag>
    );
  }
  if (hasCheckOut) {
    return (
      <Tag color="green" icon={<CheckCircleOutlined />}>
        {t.checkedOut}
      </Tag>
    );
  }
  return (
    <Tag color="blue" icon={<ClockCircleOutlined />}>
      {t.present}
    </Tag>
  );
};

export const AttendanceList: React.FC = () => {
  const { language } = useLanguage();
  const t = ATTENDANCE_LIST_TRANSLATIONS[language];
  const intlLocale = getIntlLocale(language);
  // Configuramos useTable con ordenamiento inicial por fecha descendente
  const { tableProps } = useTable({
    sorters: {
      initial: [
        {
          field: "attendanceDate",
          order: "desc",
        },
      ],
    },
    pagination: {
      pageSize: 10,
    },
    syncWithLocation: false,
  });

  const { data: childrenWithStatus, isLoading: loadingChildren } = useChildrenWithStatus();
  const { data: stats, isLoading: loadingStats } = useAttendanceStats();

  // Combinamos los datos para mostrar niños ausentes HOY
  const combinedDataSource = React.useMemo(() => {
    if (!tableProps.dataSource || !childrenWithStatus) return tableProps.dataSource;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentData = [...(tableProps.dataSource || [])];
    
    // Identificar registros de hoy que ya están en el dataSource
    const todayRecordsChildIds = new Set(
      currentData
        .filter(r => {
          const rDate = r.attendanceDate ? new Date(r.attendanceDate).toISOString().split('T')[0] : "";
          return rDate === todayStr;
        })
        .map(r => r.childId)
    );

    // Si estamos en la página 1, inyectamos los niños que faltan por hoy (ausentes)
    const isFirstPage = (tableProps.pagination as any)?.current === 1 || !(tableProps.pagination as any)?.current;
    
    if (isFirstPage) {
      const absentKids = childrenWithStatus.filter(c => !todayRecordsChildIds.has(c.id));
      
      const virtualRecords = absentKids.map(c => ({
        id: `virtual-absent-${c.id}`,
        childId: c.id,
        child: c,
        attendanceDate: todayStr,
        isPresent: false,
        checkInTime: null,
        checkOutTime: null,
        isVirtual: true,
      }));

      // Unimos y ordenamos: Presentes hoy > Ausentes hoy > Resto (Fecha DESC)
      const todayCombined = [
        ...currentData.filter(r => {
          const rDate = r.attendanceDate ? new Date(r.attendanceDate).toISOString().split('T')[0] : "";
          return rDate === todayStr;
        }),
        ...virtualRecords
      ];

      // Ordenar hoy: Presente (0) → Ausente (1) → Retirado (2)
      const getStatusOrder = (r: any) => {
        if (r.checkInTime && !r.checkOutTime) return 0; // Presente
        if (!r.checkInTime) return 1;                   // Ausente
        return 2;                                        // Retirado
      };
      todayCombined.sort((a, b) => getStatusOrder(a) - getStatusOrder(b));

      const historical = currentData.filter(r => {
        const rDate = r.attendanceDate ? new Date(r.attendanceDate).toISOString().split('T')[0] : "";
        return rDate !== todayStr;
      });

      return [...todayCombined, ...historical];
    }

    // En páginas > 1 solo mostramos registros históricos (no de hoy)
    return currentData.filter(r => {
      const rDate = r.attendanceDate ? new Date(r.attendanceDate).toISOString().split('T')[0] : "";
      return rDate !== todayStr;
    });
  }, [tableProps.dataSource, childrenWithStatus, tableProps.pagination]);

  const columns = [
    {
      title: t.child,
      dataIndex: ["child", "firstName"],
      key: "child",
      render: (_: any, record: any) => (
        <Space>
          <Avatar 
            src={record.child?.profilePicture} 
            icon={<UserOutlined />}
            size="small"
          />
          <div>
            <div>{record.child?.firstName} {record.child?.lastName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t.id}: {record.childId}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: t.date,
      dataIndex: "attendanceDate",
      key: "attendanceDate",
      render: (value: string) => (
        <DateField
          value={value}
          format={language === "spanish" ? "YYYY-MM-DD" : "MM-DD-YYYY"}
        />
      ),
    },
    {
      title: t.checkIn,
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (value: string) => value ? (
        <Text>{new Date(value).toLocaleTimeString(intlLocale, { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}</Text>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: t.checkOut,
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      render: (value: string) => value ? (
        <Text>{new Date(value).toLocaleTimeString(intlLocale, { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}</Text>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: t.status,
      dataIndex: "isPresent",
      key: "isPresent",
      render: (_: any, record: any) => {
        const status: AttendanceStatus = {
          isPresent: record.isPresent,
          isCheckedIn: !!record.checkInTime,
          isCheckedOut: !!record.checkOutTime,
          attendance: record
        };
        return <AttendanceStatusComponent status={status} t={t} />;
      },
    },
    {
      title: t.deliveredBy,
      dataIndex: ["deliveredBy2", "name"],
      key: "deliveredBy",
      render: (value: string, record: any) => value ? (
        <Tooltip title={`${record.deliveredBy2?.relationship} - ${record.deliveredBy2?.phone}`}>
          <Text>{value}</Text>
        </Tooltip>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: t.pickedUpBy,
      dataIndex: ["pickedUpBy2", "name"],
      key: "pickedUpBy",
      render: (value: string, record: any) => value ? (
        <Tooltip title={`${record.pickedUpBy2?.relationship} - ${record.pickedUpBy2?.phone}`}>
          <Text>{value}</Text>
        </Tooltip>
      ) : <Text type="secondary">-</Text>,
    },
    {
      title: t.notes,
      key: "notes",
      render: (_: any, record: any) => {
        const checkInNotes = record.checkInNotes || t.notAvailable;
        const checkOutNotes = record.checkOutNotes || t.notAvailable;
        const notesText = `${t.checkIn}: ${checkInNotes} / ${t.checkOut}: ${checkOutNotes}`;
        
        return (
          <Tooltip title={notesText}>
            <Text ellipsis style={{ maxWidth: 150 }}>
              {notesText}
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: t.actions,
      key: "actions",
      render: (_: any, record: any) => {
        if (record.isVirtual) return null; // No mostrar acciones para registros virtuales
        return (
          <Space>
            <EditButton 
              hideText 
              size="small" 
              recordItemId={record.id}
            />
            <DeleteButton hideText size="small" recordItemId={record.id} />
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title={t.totalChildren}
              value={stats?.totalChildren || 0}
              loading={loadingStats}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t.presentToday}
              value={stats?.presentToday || 0}
              loading={loadingStats}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t.absentToday}
              value={stats?.absentToday || 0}
              loading={loadingStats}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title={t.attendanceRate}
              value={stats?.attendanceRate || 0}
              loading={loadingStats}
              suffix="%"
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      {/* Attendance List */}
      <List title={t.title}>
        <Table
          {...tableProps}
          dataSource={combinedDataSource}
          columns={columns}
          rowKey="id"
          loading={tableProps.loading || loadingChildren}
          pagination={{
            ...tableProps.pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} ${t.of} ${total} ${t.recordsOf}`,
          }}
        />
      </List>
    </div>
  );
};
